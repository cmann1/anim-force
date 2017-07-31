///<reference path="Bone.ts"/>
///<reference path='DrawList.ts'/>

namespace app.model
{

	export class Model
	{

		public name:string = 'Unnamed Model';
		public rootBones:Bone[] = [];
		public rootBoneCount = 0;

		protected drawList:DrawList = new DrawList();

		constructor()
		{

		}

		public addRootBone(bone:Bone):Bone
		{
			if(bone.model == this && bone.parent == null)
			{
				return bone;
			}

			if(bone.parent)
			{
				bone.parent.removeChild(bone);
			}

			bone.setModel(this);
			this.rootBones.push(bone);
			this.rootBoneCount++;

			return bone;
		}

		public removeRootBone(bone:Bone):Bone
		{
			if(bone.model == this && bone.parent == null)
			{
				bone.setModel(null);
				this.rootBones.splice(this.rootBones.indexOf(bone), 1);
				this.rootBoneCount--;
			}

			return bone;
		}

		public prepareForDrawing()
		{
			for(var bone of this.rootBones)
			{
				bone.prepareForDrawing(0, 0, 1, 1, 0, this.drawList);
			}
		}

		public draw(ctx:CanvasRenderingContext2D)
		{
			this.drawList.clear();
			this.prepareForDrawing();

			ctx.save();
			var drawList:Node[] = this.drawList.list;
			drawList.sort(Model.nodeDrawOrder);
			for(var node of drawList)
			{
				node.draw(ctx);
			}
			ctx.restore();

			ctx.save();
			for(var bone of this.rootBones)
			{
				bone.drawControls(ctx);
			}
			ctx.restore();
		}

		protected static nodeDrawOrder(a:Node, b:Node):number
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
		}

	}

}