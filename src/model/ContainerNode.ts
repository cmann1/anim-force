namespace app.model
{

	export class ContainerNode extends Node
	{
		public children:Node[] = [];
		public childCount:number = 0;

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
				return this
			}

			if(child.parent)
			{
				child.parent.removeChild(child, false);
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

			return index < 0
				? this
				: this.children[index];
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