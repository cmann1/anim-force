namespace app.model
{

	import EventDispatcher = app.events.EventDispatcher;
	import StructureChangeEvent = events.StructureChangeEvent;
	import SelectionEvent = events.SelectionEvent;
	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;
	import Animation = app.anim.Animation;
	import Event = app.events.Event;

	export enum EditMode
	{
		EDIT,
		ANIMATE,
		PLAYBACK
	}

	export class Model extends ContainerNode
	{
		private nextAnimationId:number = 0;

		private selectedNode:Node = null;
		private highlightedNode:Node = null;

		private drawList:DrawList = new DrawList();

		private _mode:EditMode = EditMode.EDIT;

		private bindPose:app.anim.Animation = new app.anim.Animation('None', this, true);
		private animations:{[id:string]:app.anim.Animation} = {};
		private activeAnimation:app.anim.Animation = null;
		private animationList:app.anim.Animation[] = null;

		/// Events

		public modeChange:EventDispatcher<Model> = new EventDispatcher<Model>();
		public selectionChange:EventDispatcher<Model> = new EventDispatcher<Model>();
		public animationChange:EventDispatcher<Animation> = new EventDispatcher<Animation>();

		constructor()
		{
			super('Unnamed Model');
			this.model = this;
			this.type = 'model';

			this.bindPose.active = true;
			this.activeAnimation = this.bindPose;
		}

		public draw(ctx:CanvasRenderingContext2D, worldScale:number)
		{
			console.error('Use drawModel instead');
		}

		public prepareChildren()
		{
			this.drawList.clear();

			for(var child of this.children)
			{
				child.prepareForDrawing(0, 0, 1, 1, 1, 0, null, null);
			}
		}

		public drawModel(ctx:CanvasRenderingContext2D, worldScale:number, viewport:AABB)
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

			ctx.save();
			var drawList:Node[] = this.drawList.list;
			drawList.sort(this.nodeDrawOrder);
			for(var node of drawList)
			{
				node.draw(ctx, worldScale);
			}
			ctx.restore();

			ctx.save();

			if(Config.drawControls)
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
				// this.childrenWorldAABB.draw(ctx, worldScale, Config.childrenAABB);
				this.worldAABB.draw(ctx, worldScale, '#0FF');
			}

			ctx.restore();
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

		public setSelected(selected:boolean)
		{
			if(selected)
			{
				this.setSelectedNode(null);
			}
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

		public getSelectedNode():Node
		{
			return this.selectedNode;
		}

		public getActiveAnimation():app.anim.Animation
		{
			return this.activeAnimation;
		}

		public getBindPose():app.anim.Animation
		{
			return this.bindPose;
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

		public clear():void
		{
			this.selectedNode = null;
			this.highlightedNode = null;

			this.bindPose.clear();
			this.animations = {};
			this.activeAnimation = this.bindPose;

			this.animationChange.dispatch(this.bindPose, new Event('updateAnimationList'));

			super.clear();
		}

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean
		{
			if(this.selectedNode && this.selectedNode.hitTest(x, y, worldScaleFactor, result))
			{
				return true;
			}

			return super.hitTest(x, y, worldScaleFactor, result);
		}

		public animateStep(deltaTime:number)
		{
			this.activeAnimation.animateStep(deltaTime);
		}

		public addNewAnimation(name:string, select:boolean=false)
		{
			if(name == null || name == 'None')
			{
				name = 'Untitled Animation ' + (++this.nextAnimationId);
			}

			var newName = name;
			var newIndex = 1;
			while(this.animations[newName])
			{
				newName = name + ' ' + newIndex;
				newIndex++;
			}

			var anim = new app.anim.Animation(newName, this);
			this.animations[newName] = anim;
			this.animationList = null;
			this.animationChange.dispatch(anim, new Event('newAnimation'));

			if(select)
			{
				this.setActiveAnimation(newName);
			}
		}

		public setActiveAnimation(name:string)
		{
			if(this._mode == EditMode.PLAYBACK) return;
			var anim = name == 'None' ? this.bindPose : this.animations[name];

			if(anim && anim != this.activeAnimation)
			{
				if(this.activeAnimation)
				{
					this.activeAnimation.active = false;
				}

				anim.active = true;
				this.activeAnimation = anim;
				this.animationChange.dispatch(anim, new Event('setAnimation'));
				this.activeAnimation.updateNodes();

				this.setMode(anim == this.bindPose ? EditMode.EDIT : EditMode.ANIMATE);
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

		public get mode():app.model.EditMode
		{
			return this._mode;
		}

		public set mode(value:EditMode)
		{
			if(value == EditMode.EDIT) return;

			this.setMode(value);
		}

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

		protected nodeDrawOrder = (a:Node, b:Node):number =>
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

		/*
		 * Events
		 */

		public onStructureChange(type:string, parent:ContainerNode, source:Node, index:number, other:Node)
		{
			this.structureChange.dispatch(this, new StructureChangeEvent(type, parent, source, index, other));
		}

	}

}