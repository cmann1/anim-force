namespace app.model
{

	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;
	import LoadData = app.projects.LoadData;

	export class ContainerNode extends Node
	{
		public children:Node[] = [];
		public childCount:number = 0;

		public stretchX:number = 1;
		public stretchY:number = 1;

		public worldEndPointX:number = 0;
		public worldEndPointY:number = 0;

		public childrenWorldAABB:AABB = new AABB();

		/// UI

		public collapsed:boolean = false;

		constructor(name:string=null)
		{
			super(name);

			this.canHaveChildren = true;
		}

		public getChildAt(index:number):Node
		{
			if(this.childCount == 0) return null;

			if(index < 0) index = 0;
			if(index >= this.childCount) index = this.childCount - 1;

			return this.children[index];
		}

		public addChild(child:Node, triggerEvent=true):Node
		{
			if(child.parent == this)
			{
				this.children.splice(this.children.indexOf(child), 1);
				this.children.push(child);
			}
			else
			{
				if(child.parent)
				{
					child.parent.removeChild(child, false);

					child.rotation = child.worldRotation - this.worldRotation;
					var local = this.globalToLocal(child.worldX - this.worldEndPointX + this.worldX, child.worldY - this.worldEndPointY + this.worldY);
					child.offsetX = local.x / this.stretchX;
					child.offsetY = local.y / this.stretchY;
				}

				child.setModel(this.model);
				child.parent = this;
				this.children.push(child);
				this.childCount++;
			}

			if(triggerEvent)
			{
				this.onStructureChange('addChild', this, child, this.childCount - 1, null);
			}

			return child;
		}

		public addChildBefore(child:Node, sibling:Node):Node
		{
			if(!sibling) return this.addChild(child);
			if(sibling.parent != this) throw new Error('ContainerNode.addChildBefore: sibling not child of parent');

			if(child.parent == this && this.children.indexOf(child) == this.children.indexOf(sibling) - 1) return;

			if(child.parent)
			{
				if(child.parent == this)
				{
					this.children.splice(this.children.indexOf(child), 1);
				}
				else
				{
					child.rotation = child.worldRotation - this.worldRotation;
					var local = this.globalToLocal(child.worldX - this.worldEndPointX + this.worldX, child.worldY - this.worldEndPointY + this.worldY);
					child.offsetX = local.x / this.stretchX;
					child.offsetY = local.y / this.stretchY;

					child.parent.removeChild(child, false);
				}
			}

			child.parent = this;
			child.setModel(this.model);
			this.children.splice(this.children.indexOf(sibling), 0, child);
			this.childCount = this.children.length;

			this.onStructureChange('addChild', this, child, this.children.indexOf(child), sibling);

			return child;
		}

		public addChildAfter(child:Node, sibling:Node):Node
		{
			if(!sibling) return this.addChild(child);
			if(sibling.parent != this) return child;
			var index = this.children.indexOf(sibling);

			this.addChildBefore(child, this.children[index + 1]);

			return child;
		}

		public removeChild(child:Node, triggerEvent=true):Node
		{
			if(child.parent == this)
			{
				const index = this.children.indexOf(child);

				child.setModel(null);
				child.parent = null;
				this.children.splice(index, 1);
				this.childCount--;

				if(triggerEvent)
				{
					this.onStructureChange('removeChild', this, child, index, null);
				}
			}

			return child;
		}

		public previous(node:Node=null)
		{
			if(!node)
			{
				if(!this.parent)
				{
					return this;
				}

				return this.parent.previous(this);
			}
			if(node.parent != this) return this;

			var index = this.children.indexOf(node) - 1;
			if(index < 0) return this;

			var previous = this.children[index];

			if(previous instanceof ContainerNode)
			{
				return previous.childCount ? previous.children[previous.childCount - 1] : previous;
			}

			return previous;
		}

		public next(node:Node=null)
		{
			if(!node)
			{
				if(this.childCount)
				{
					return this.children[0];
				}
				if(!this.parent)
				{
					return this;
				}

				return this.parent.next(this);
			}
			if(node.parent != this) return this;

			var index = this.children.indexOf(node) + 1;

			return index >= this.childCount
				? this.parent ? this.parent.next(this) : this
				: this.children[index];
		}

		public increaseLayer(amount:number, subLayer=false, recurse=false)
		{
			super.increaseLayer(amount, subLayer, recurse);

			if(recurse)
			{
				for(var child of this.children)
				{
					child.increaseLayer(amount, subLayer, recurse);
				}
			}
		}

		public resetLength()
		{
			if(this.model.mode != EditMode.EDIT)
			{
				if(this.stretchY != 1)
				{
					this.stretchY = 1;
					this.onPropertyChange('stretchY');
				}
			}
		}

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction, recursive=true):boolean
		{
			if(recursive && this.childrenWorldAABB.contains(x, y))
			{
				for(let i = this.childCount - 1; i >= 0; i--)
				{
					const child = this.children[i];

					if(!child.locked && child.hitTest(x, y, worldScaleFactor, result, true))
					{
						return true;
					}
				}
			}

			return super.hitTest(x, y, worldScaleFactor, result, recursive);
		}

		public hitTestControls(x:number, y:number, worldScaleFactor:number, result:Interaction, recursive=true):boolean
		{
			if(super.hitTestControls(x, y, worldScaleFactor, result, recursive)) return true;

			if(recursive && this.childrenWorldAABB.contains(x, y))
			{
				for(let i = this.childCount - 1; i >= 0; i--)
				{
					const child = this.children[i];

					if(!child.locked && child.hitTestControls(x, y, worldScaleFactor, result, true))
					{
						return true;
					}
				}
			}

			return false;
		}

		public setModel(model:Model)
		{
			super.setModel(model);

			for(var child of this.children)
			{
				child.setModel(model);
			}
		}

		public setLocked(value:boolean, recurse=false)
		{
			this.locked = value;

			if(recurse)
			{
				for(var child of this.children)
				{
					child.setLocked(value, true);
				}
			}
		}

		public setVisible(value:boolean, recurse=false)
		{
			this.visible = value;

			if(recurse)
			{
				for(var child of this.children)
				{
					child.setVisible(value, true);
				}
			}
		}

		public clear():void
		{
			for(let child of this.children)
			{
				child.setModel(null);
			}

			this.setSelected(null);

			this.children = [];
			this.childCount = 0;

			this.onStructureChange('clear', this, null, -1, null);
		}

		public resetToBindPose(recurse:boolean)
		{
			if(recurse)
			{
				for(let child of this.children)
				{
					child.resetToBindPose(true);
				}
			}

			super.resetToBindPose(recurse);
		}

		//

		protected copyFrom(from:ContainerNode, recursive=true):ContainerNode
		{
			super.copyFrom(from, recursive);

			this.children = [];
			this.childCount = recursive ? from.childCount : 0;

			if(recursive)
			{
				for(var child of from.children)
				{
					child = child.clone();
					child.parent = this;
					this.children.push(child);
				}
			}

			this.stretchX = from.stretchX;
			this.stretchY = from.stretchY;

			this.worldEndPointX = from.worldEndPointX;
			this.worldEndPointY = from.worldEndPointY;

			return this;
		}

		public save():any
		{
			var data = super.save();

			if(!(this instanceof Model))
			{
				data.collapsed = this.collapsed;
			}

			data.children = [];
			for(var child of this.children)
			{
				data.children.push(child.save());
			}

			return data;
		}

		public load(data:LoadData):ContainerNode
		{
			super.load(data);

			if(!(this instanceof Model))
			{
				this.collapsed = data.get('collapsed');
			}

			var children = data.get('children');

			for(var childData of children)
			{
				this.addChild(Node.load(data.asLoadData(childData)), false);
			}

			return this;
		}

	}

}