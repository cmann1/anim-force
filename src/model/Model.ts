namespace app.model
{

	import EventDispatcher = app.events.EventDispatcher;
	import StructureChangeEvent = events.StructureChangeEvent;
	import SelectionEvent = events.SelectionEvent;
	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;
	import Animation = app.anim.Animation;
	import Event = app.events.Event;
	import LoadData = app.projects.LoadData;
	import PropertyChangeEvent = app.model.events.PropertyChangeEvent;

	export enum EditMode
	{
		EDIT,
		ANIMATE,
		PLAYBACK
	}

	export class Model extends ContainerNode
	{
		private nextAnimationId:number = 0;

		private nodeMap:any = {};
		private selectedNode:Node = null;
		private highlightedNode:Node = null;

		private drawList:DrawList = new DrawList();

		private _mode:EditMode = EditMode.EDIT;

		private bindPose:app.anim.Animation = new app.anim.Animation('None', this, true);
		private animations:{[id:string]:app.anim.Animation} = {};
		private activeAnimation:app.anim.Animation = null;
		private animationList:app.anim.Animation[] = null;

		/// Events

		public change:EventDispatcher<Model> = new EventDispatcher<Model>();
		public modeChange:EventDispatcher<Model> = new EventDispatcher<Model>();
		public selectionChange:EventDispatcher<Model> = new EventDispatcher<Model>();
		public animationChange:EventDispatcher<Animation> = new EventDispatcher<Animation>();

		constructor()
		{
			super('Untitled Model');
			this.model = this;
			this.type = 'model';

			this.bindPose.active = true;
			this.activeAnimation = this.bindPose;

			this.layer = this.subLayer = MAX_LAYER + 10;
			this.updateLayer();
		}

		//

		public animateStep(deltaTime:number)
		{
			this.activeAnimation.animateStep(deltaTime);
		}

		public draw(ctx:CanvasRenderingContext2D, worldScale:number)
		{
			console.error('Use drawModel instead');
		}

		public drawModel(ctx:CanvasRenderingContext2D, worldScale:number, viewport:AABB)
		{
			// Update draw list
			{
				this.drawList.clear();
				var i = 0;
				for(var child of this.children)
				{
					child.prepareForDrawing(0, 0, worldScale, 1, 1, 0, this.drawList, viewport);

					if(i++ == 0)
					{
						this.childrenWorldAABB.from(child.worldAABB);
					}
					else
					{
						this.childrenWorldAABB.union(child.worldAABB);
					}
				}

				this.worldAABB.from(this.childrenWorldAABB);

				this.drawList.list.sort(this.nodeDrawOrder);
			}

			ctx.save();
			const drawList:Node[] = this.drawList.list;
			for(var node of drawList)
			{
				node.draw(ctx, worldScale);
			}
			ctx.restore();

			ctx.save();

			if(Config.showControls)
			{
				for(var child of this.children)
				{
					if(child != this.selectedNode && child.worldAABB.intersects(viewport))
					{
						child.drawControls(ctx, worldScale, viewport);
					}
				}

				if(this.selectedNode && this.selectedNode.worldAABB.intersects(viewport))
				{
					this.selectedNode.drawControls(ctx, worldScale, viewport);
				}
			}

			if(Config.drawAABB)
			{
				this.childrenWorldAABB.draw(ctx, worldScale, Config.childrenAABB);
				this.worldAABB.draw(ctx, worldScale, '#0FF');
			}

			ctx.restore();
		}

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean
		{
			if(this.selectedNode && this.selectedNode.hitTestControls(x ,y, worldScaleFactor, result))
			{
				return true;
			}

			if(this.hitTestControls(x ,y, worldScaleFactor, result))
			{
				return true;
			}

			const drawList = this.drawList.list;
			var i = drawList.length - 1;

			if(this.selectedNode)
			{
				if(result.selectUnderneath)
				{
					i = drawList.indexOf(this.selectedNode) - 1;
					if(i < 0) i = drawList.length - 1;
				}
				else if(this.selectedNode.hitTest(x, y, worldScaleFactor, result, false))
				{
					return true;
				}
			}

			if(this.hitTestControls(x ,y, worldScaleFactor, result))
			{
				return true;
			}


			while(i >= 0)
			{
				const node = drawList[i--];
				if(!node.locked && node.hitTest(x ,y, worldScaleFactor, result, false))
				{
					return true;
				}
			}

			return false;
			// return super.hitTest(x, y, worldScaleFactor, result);
		}

		public prepareChildren()
		{
			this.drawList.clear();

			for(var child of this.children)
			{
				child.prepareForDrawing(0, 0, 1, 1, 1, 0, null, null);
			}
		}

		//

		public duplicateSelected(recursive=true):Node
		{
			if(!this.selectedNode) return null;

			var copy = this.selectedNode.clone(recursive);

			if(copy)
			{
				this.selectedNode.parent.addChild(copy);
			}

			return copy;
		}

		public getActiveAnimation():app.anim.Animation
		{
			return this.activeAnimation;
		}

		public setActiveAnimation(name:string, forceUpdate=false)
		{
			if(this._mode == EditMode.PLAYBACK) return;
			var anim = (name == 'None' ? this.bindPose : this.animations[name]) || this.bindPose;

			var requiresUpdate = false;

			if(anim != this.activeAnimation)
			{
				if(this.activeAnimation)
				{
					this.activeAnimation.active = false;
				}

				anim.active = true;
				this.activeAnimation = anim;
				this.animationChange.dispatch(anim, new Event('setAnimation'));
				requiresUpdate = true;

				this.setMode(anim == this.bindPose ? EditMode.EDIT : EditMode.ANIMATE);
			}

			if(forceUpdate || requiresUpdate)
			{
				this.activeAnimation.updateNodes();
			}
		}

		public getAllAnimations():app.anim.Animation[]
		{
			var anims = [this.bindPose];

			for(var animName in this.animations)
			{
				anims.push(this.animations[animName]);
			}

			return anims;
		}

		public setAnimationListeners(callback:(animation:Animation, event:Event) => void)
		{
			this.bindPose.change.on(callback);

			for(var animName in this.animations)
			{
				this.animations[animName].change.on(callback);
			}
		}

		public getAnimationList():app.anim.Animation[]
		{
			if(this.animationList) return this.animationList;

			var animNames:string[] = [];

			for(var animName in this.animations)
			{
				animNames.push(animName);
			}
			animNames.sort(Utils.naturalCompare);

			var anims:app.anim.Animation[] = [this.bindPose];
			for(var animName of animNames)
			{
				anims.push(this.animations[animName]);
			}

			this.animationList = anims;
			return anims;
		}

		public getBindPose():app.anim.Animation
		{
			return this.bindPose;
		}

		public setHighlighted(highlighted:boolean)
		{
			if(highlighted)
			{
				this.setHighlightedNode(null);
			}
		}

		public setHighlightedNode(node:Node)
		{
			if(this.highlightedNode == node) return;

			if(this.highlightedNode)
			{
				this.highlightedNode.highlighted = false;
			}

			if((this.highlightedNode = node))
			{
				this.highlightedNode.highlighted = true;
			}

			this.selectionChange.dispatch(this, new SelectionEvent('highlight', node));
		}

		public getNodeList(skipCollapsedNodes=false):Node[]
		{
			var nodes:Node[] = [];
			var nodeQueue:Node[] = [];
			var i = -1;
			for(var j = this.childCount - 1; j >= 0; j--) nodeQueue[++i] = this.children[j];

			while(i >= 0)
			{
				var node:Node = nodeQueue[i--];

				if(node instanceof ContainerNode && (!node.collapsed || !skipCollapsedNodes))
				{
					for(var j = node.childCount - 1; j >= 0; j--) nodeQueue[++i] = node.children[j];
				}

				nodes.push(node);
			}

			return nodes;
		}

		public setSelected(selected:boolean)
		{
			if(selected)
			{
				this.setSelectedNode(null);
			}
		}

		public getSelectedNode():Node
		{
			return this.selectedNode;
		}

		public setSelectedNode(node:Node)
		{
			if(this.selectedNode == node) return;

			if(this.selectedNode)
			{
				this.selectedNode.selected = false;
			}

			if((this.selectedNode = <Node>node))
			{
				this.selectedNode.selected = true;
			}

			this.selectionChange.dispatch(this, new SelectionEvent('selection', <Node>node));
		}

		public updateNodeVisibility(node:Node)
		{
			this.selectionChange.dispatch(this, new SelectionEvent('visibility', node));
		}

		//

		get locked():boolean
		{
			return true;
		}

		get visible():boolean
		{
			return true;
		}

		//

		public clear():void
		{
			this.nodeMap = {};
			this.selectedNode = null;
			this.highlightedNode = null;

			super.clear();

			this.bindPose.clear();
			this.animations = {};
			this.animationList = null;
			this.activeAnimation = this.bindPose;
			this.setMode(EditMode.EDIT);

			this.animationChange.dispatch(this.bindPose, new Event('updateAnimationList'));
		}

		public addNode(node:Node)
		{
			this.nodeMap[node.id] = node;
			node.propertyChange.on(this.onNodePropertyChange);
		}

		public removeNode(node:Node)
		{
			delete this.nodeMap[node.id];
			node.propertyChange.off(this.onNodePropertyChange);
		}

		public getNode(id):Node
		{
			return this.nodeMap[id];
		}

		public addNewAnimation(name:string, select:boolean=false, copyFrom:boolean=false)
		{
			if(copyFrom && !this.activeAnimation) copyFrom = false;

			if(name == null || name == 'None')
			{
				if(copyFrom)
				{
					name = this.activeAnimation.name + '_copy';
				}
				else
				{
					name = 'Untitled Animation ' + (++this.nextAnimationId);
				}
			}

			var newName = name;
			var newIndex = 1;
			while(this.animations[newName])
			{
				newName = name + ' ' + newIndex;
				newIndex++;
			}

			var anim = new app.anim.Animation(newName, this);
			if(copyFrom) anim.copyFrom(this.activeAnimation);
			this.animations[newName] = anim;
			this.animationList = null;
			this.animationChange.dispatch(anim, new Event('newAnimation'));

			if(select)
			{
				this.setActiveAnimation(newName);
			}
		}

		public deleteAnimation(anim:app.anim.Animation=null)
		{
			if(!anim) anim = this.activeAnimation;
			if(anim == this.bindPose) return;

			var animList = this.getAnimationList();
			var animIndex = animList.indexOf(anim);

			delete this.animations[anim.name];
			this.animationList = null;
			this.animationChange.dispatch(anim, new Event('updateAnimationList'));

			animList = this.getAnimationList();
			if(animIndex >= animList.length) animIndex = animList.length - 1;

			this.setActiveAnimation(animList[animIndex].name);
		}

		public renameAnimation(anim:app.anim.Animation, newName:string)
		{
			newName = $.trim(newName);

			if(newName == anim.name || this.animations[newName]) return;

			delete this.animations[anim.name];
			this.animations[newName] = anim;
			anim.name = newName;

			this.animationList = null;
			this.animationChange.dispatch(this.bindPose, new Event('updateAnimationList'));
			this.animationChange.dispatch(anim, new Event('setAnimation'));
		}

		public increaseSelectedNodeLayer(amount:number, subLayer=false, recurse=false)
		{
			if(!this.selectedNode) return;

			this.selectedNode.increaseLayer(amount, subLayer, recurse);
		}

		public get mode():app.model.EditMode
		{
			return this._mode;
		}

		public set mode(value:EditMode)
		{
			if(value == EditMode.EDIT) return;

			this.setMode(value);
		}

		//

		public save():any
		{
			var data = super.save();

			data.nextAnimationId = this.nextAnimationId;
			data.mode = this.mode;
			data.bindPose = this.bindPose.save();
			data.animations = {};
			data.activeAnimation = this.activeAnimation.name;
			data.selectedNode = this.selectedNode ? this.selectedNode.id : -1;

			for(var animName in this.animations)
			{
				data.animations[animName] = this.animations[animName].save();
			}

			return data;
		}

		public load(data:LoadData):Model
		{
			// console.log(data);
			this.nodeMap = {};

			super.load(data);

			this.nextAnimationId = data.get('nextAnimationId');
			this._mode = data.get('mode');

			this.bindPose.initTracksFromModel(false);
			this.bindPose.load(data.asLoadData('bindPose'));

			var animations = data.get('animations');

			for(var animName in animations)
			{
				if(!animations.hasOwnProperty(animName)) continue;

				var animData = data.asLoadData(animations[animName]);
				animData = data.asLoadData(animData);
				this.animations[animName] = new app.anim.Animation(null, this, false, false).load(animData);
			}

			this.setActiveAnimation(data.get('activeAnimation'), true);

			const selectedNodeId = data.get('selectedNode');
			if(selectedNodeId != -1)
			{
				const node = this.nodeMap[selectedNodeId];
				if(node)
				{
					this.setSelectedNode(node);
				}
				else
				{
					console.log('Invalid node id for selected node');
				}
			}

			return this;
		}

		//

		protected setMode(value:EditMode)
		{
			if(this._mode == value) return;

			if(value == EditMode.PLAYBACK)
			{
				this.activeAnimation.initForAnimation();
			}

			this._mode = value;
			this.modeChange.dispatch(this, new Event('mode'));
		}

		protected updateLayer()
		{

		}

		protected nodeDrawOrderSelect = (a:Node, b:Node):number =>
		{
			if(a.layer < b.layer || b == this.selectedNode)
			{
				return -1;
			}
			if(a.layer > b.layer || a == this.selectedNode)
			{
				return 1;
			}

			if(a.subLayer < b.subLayer || b == this.selectedNode)
			{
				return -1;
			}
			if(a.subLayer > b.subLayer || a == this.selectedNode)
			{
				return 1;
			}

			return a.drawIndex - b.drawIndex;
		};

		protected nodeDrawOrder = (a:Node, b:Node):number =>
		{
			if(a.layer < b.layer)
			{
				return -1;
			}
			if(a.layer > b.layer)
			{
				return 1;
			}

			if(a.subLayer < b.subLayer)
			{
				return -1;
			}
			if(a.subLayer > b.subLayer)
			{
				return 1;
			}

			return a.drawIndex - b.drawIndex;
		};

		/*
		 * Events
		 */

		protected onNodePropertyChange = (sender:Node, event:PropertyChangeEvent) =>
		{
			this.change.dispatch(this, new Event('change'));
		};

		public onStructureChange(type:string, parent:ContainerNode, source:Node, index:number, other:Node)
		{
			this.structureChange.dispatch(this, new StructureChangeEvent(type, parent, source, index, other));
		}

	}

}