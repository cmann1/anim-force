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

			var eventType = 'addChild';

			if(child.parent)
			{
				child.parent.removeChild(child, false);
				eventType = 'reParent';
			}

			child.model = this.model;
			child.parent = this;
			this.children.push(child);
			this.childCount++;

			if(triggerEvent)
			{
				this.onStructureChange(eventType, this, child, this.childCount - 1);
			}

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
					this.onStructureChange('removeChild', this, child, index);
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

			this.onStructureChange('clear', this, null, -1);
		}

	}

}