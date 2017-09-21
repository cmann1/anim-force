namespace app.model
{

	import Interaction = app.viewport.Interaction;
	import AABB = app.viewport.AABB;

	export class BoxNode extends Node
	{
		protected boxWidth:number = 50;
		protected boxHeight:number = 50;

		protected _allowRotation:boolean = false;
		protected _allowScale:boolean = false;
		protected drawOutline:boolean = true;
		protected hitRadius = -1;

		public rotationHandle:Handle;
		public scaleHandle:Handle;
		public scaleXHandle:Handle;
		public scaleYHandle:Handle;

		constructor(name:string, allowRotation=true, allowScale=true)
		{
			super(name);

			this.allowRotation = allowRotation;
			this.allowScale = allowScale;
		}

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction, recursive=true):boolean
		{
			const w = Math.abs(this.boxWidth * 0.5 * this.scaleX);
			const h = Math.abs(this.boxHeight * 0.5 * this.scaleY);
			const local = MathUtils.rotate(x - this.worldX, y - this.worldY, -this.worldRotation);
			x = local.x;
			y = local.y;

			if(
				((this.selected || this.hitRadius == -1) && x >= -w && x <= w && y >= -h && y <= h) ||
				(this.hitRadius != -1 && x * x + y * y <= this.hitRadius * this.hitRadius)
			)
			{
				result.x = x;
				result.y = y;
				result.offset = this.rotation;
				result.node = this;
				result.part = 'base';
				return true;
			}

			return false;
		}

		public updateInteraction(x:number, y:number, worldScaleFactor:number, interaction:Interaction):boolean
		{
			const part = interaction.part;

			if(part == 'scale' || part == 'scaleX' || part == 'scaleY')
			{
				const local = MathUtils.rotate(x - this.worldX - interaction.x, y - this.worldY - interaction.y, this._allowRotation ? -this.worldRotation : 0);

				if(part == 'scale' && interaction.constrain)
				{
					var scale = Math.sqrt(local.x * local.x + local.y * local.y) / interaction.offset;
					this.scaleX = interaction.initialX * scale;
					this.scaleY = interaction.initialY * scale;
					this.onPropertyChange('scaleX');
					this.onPropertyChange('scaleY');
				}
				else
				{
					if(part == 'scale' || part == 'scaleX')
					{
						this.scaleX = local.x / (this.boxWidth * 0.5);
					}
					if(part == 'scale' || part == 'scaleY')
					{
						this.scaleY = local.y / (this.boxHeight * 0.5);
					}

					if(part == 'scale')
					{
						this.onPropertyChange('scaleX');
						this.onPropertyChange('scaleY');
					}
					else if(part == 'scaleX')
					{
						this.onPropertyChange('scaleX');
					}
					else
					{
						this.onPropertyChange('scaleY');
					}
				}

				return true;
			}

			return super.updateInteraction(x, y, worldScaleFactor, interaction);
		}

		public prepareForDrawing(worldX:number, worldY:number, worldScale:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList, viewport:AABB)
		{
			super.prepareForDrawing(worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);

			const x = this.worldX;
			const y = this.worldY;
			const w = this.boxWidth * 0.5 * this.scaleX;
			const h = this.boxHeight * 0.5 * this.scaleY;

			if(this._allowRotation)
			{
				this.rotationHandle.active = this.selected;
				const local = MathUtils.rotate(0, -h, this.worldRotation);
				this.rotationHandle.x = x + local.x;
				this.rotationHandle.y = y + local.y;
			}

			if(this._allowScale)
			{
				this.scaleHandle.active = this.selected;
				this.scaleXHandle.active = this.selected;
				this.scaleYHandle.active = this.selected;
				this.scaleHandle.rotation = this.scaleXHandle.rotation = this.scaleYHandle.rotation = this.worldRotation;

				var local = MathUtils.rotate(w, h, this._allowRotation ? this.worldRotation : 0);
				this.scaleHandle.x = x + local.x;
				this.scaleHandle.y = y + local.y;
				local = MathUtils.rotate(w, 0, this._allowRotation ? this.worldRotation : 0);
				this.scaleXHandle.x = x + local.x;
				this.scaleXHandle.y = y + local.y;
				local = MathUtils.rotate(0, h, this._allowRotation ? this.worldRotation : 0);
				this.scaleYHandle.x = x + local.x;
				this.scaleYHandle.y = y + local.y;
			}

			this.prepareAABB(worldScale);

			if(this._allowRotation)
			{
				const scaleX = Math.abs(this.scaleX);
				const scaleY = Math.abs(this.scaleY);
				const cosR = Math.abs(Math.cos(this.worldRotation));
				const sinR = Math.abs(Math.sin(this.worldRotation));
				var w1 = (this.boxHeight * scaleY * sinR + this.boxWidth * scaleX * cosR) * 0.5;
				var h1 = (this.boxWidth * scaleX * sinR  + this.boxHeight * scaleY * cosR) * 0.5;

				this.worldAABB.unionF(
					this.worldX - w1, this.worldY - h1,
					this.worldX + w1, this.worldY + h1
				);
			}
			else{
				this.worldAABB.unionF(
					this.worldX - this.boxWidth * 0.5, this.worldY - this.boxHeight * 0.5,
					this.worldX + this.boxWidth * 0.5, this.worldY + this.boxHeight * 0.5
				);
			}

			if(this.visible && drawList && this.worldAABB.intersects(viewport))
			{
				drawList.add(this);
			}
		}

		public drawControls(ctx:CanvasRenderingContext2D, worldScale:number, viewport:AABB)
		{
			if(!this._visible || !this.worldAABB.intersects(viewport)) return;

			if((this.drawOutline && Config.drawOutlines) || this.selected || this.highlighted)
			{
				ctx.save();

				const scaleX = this.scaleX * worldScale;
				const scaleY = this.scaleY * worldScale;
				const w = this.boxWidth * 0.5;
				const h = this.boxHeight * 0.5;

				ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
				ctx.rotate(this._allowRotation ? this.worldRotation : 0);
				ctx.translate(-w * scaleX, -h * scaleY);

				ctx.setLineDash([2, 2]);
				ctx.strokeStyle = this.selected ? Config.selected : (this.highlighted ? Config.highlighted : Config.control);
				ctx.lineWidth = this.selected ? 3 : 1;
				ctx.beginPath();
				ctx.rect(0, 0, this.boxWidth * scaleX, this.boxHeight * scaleY);
				ctx.stroke();

				ctx.restore();
			}

			super.drawControls(ctx, worldScale, viewport);

			if(Config.drawAABB)
			{
				this.worldAABB.draw(ctx, worldScale);
			}
		}

		//

		get allowRotation():boolean
		{
			return this._allowRotation;
		}
		set allowRotation(allow:boolean)
		{
			if(this._allowRotation == allow) return;
			this._allowRotation = allow;

			if(allow)
			{
				if(!this.rotationHandle)
					this.rotationHandle = new Handle(this, 'rotation', Config.handleRadius, HandleShape.CIRCLE, HandleType.ROTATION, Config.handle);
				this.handles.push(this.rotationHandle);
			}
			else if(this.rotationHandle)
			{
				this.handles.splice(this.handles.indexOf(this.rotationHandle), 1);
				this.rotation = 0;
			}
		}

		get allowScale():boolean
		{
			return this._allowScale;
		}
		set allowScale(allow:boolean)
		{
			if(this._allowScale == allow) return;
			this._allowScale = allow;

			if(allow)
			{
				if(!this.scaleHandle)
					this.scaleHandle = new Handle(this, 'scale', Config.handleRadius, HandleShape.SQUARE, HandleType.SCALE, Config.handle);
				if(!this.scaleXHandle)
					this.scaleXHandle = new Handle(this, 'scaleX', Config.handleRadius, HandleShape.SQUARE, HandleType.AXIS, Config.handle);
				if(!this.scaleYHandle)
					this.scaleYHandle = new Handle(this, 'scaleY', Config.handleRadius, HandleShape.SQUARE, HandleType.AXIS, Config.handle);
				this.handles.push(this.scaleHandle);
				this.handles.push(this.scaleXHandle);
				this.handles.push(this.scaleYHandle);
			}
			else
			{
				this.handles.splice(this.handles.indexOf(this.scaleHandle), 1);
				this.handles.splice(this.handles.indexOf(this.scaleXHandle), 1);
				this.handles.splice(this.handles.indexOf(this.scaleYHandle), 1);
				this.scaleX = 1;
				this.scaleY = 1;
			}
		}

	}

}