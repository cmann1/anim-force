namespace app.model
{

	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;

	export class ContainerNode extends Node
	{
		public children:Node[] = [];
		public childCount:number = 0;

		public worldEndPointX:number = 0;
		public worldEndPointY:number = 0;

		public childrenWorldAABB:AABB = new AABB();

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
				return child
			}

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

			if(triggerEvent)
			{
				this.onStructureChange('addChild', this, child, this.childCount - 1, null);
			}

			return child;
		}

		public addChildBefore(child:Node, sibling:Node):Node
		{
			if(!sibling) return this.addChild(child);
			if(sibling.parent != this) return child;

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
					this.childCount++;
				}
			}

			child.parent = this;
			child.setModel(this.model);
			this.children.splice(this.children.indexOf(sibling), 0, child);

			this.onStructureChange('addChild', this, child, this.children.indexOf(child), sibling);

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

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean
		{
			if(this.childrenWorldAABB.contains(x, y))
			{
				for(let i = this.childCount - 1; i >= 0; i--)
				{
					const child = this.children[i];

					if(child.hitTest(x, y, worldScaleFactor, result))
					{
						return true;
					}
				}
			}

			return super.hitTest(x, y, worldScaleFactor, result);
		}

		public setModel(model:Model)
		{
			super.setModel(model);

			for(var child of this.children)
			{
				child.setModel(model);
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

	}

}