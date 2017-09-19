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

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean
		{
			if(!this.visible || !this.worldAABB.contains(x, y)) return false;

			if(this.hitTestHandles(x, y, worldScaleFactor, result))
			{
				return true;
			}

			const w = Math.abs(this.boxWidth * 0.5 * this.scaleX);
			const h = Math.abs(this.boxHeight * 0.5 * this.scaleY);

			if(this._allowRotation)
			{
				const local = MathUtils.rotate(x - this.worldX, y - this.worldY, -this.worldRotation);
				x = local.x;
				y = local.y;
			}
			else
			{
				x -= this.worldX;
				y -= this.worldY;
			}

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
				const local = MathUtils.rotate(x - this.worldX - interaction.x, y - this.worldY - interaction.y, -this.worldRotation);

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

				var local = MathUtils.rotate(w, h, this.worldRotation);
				this.scaleHandle.x = x + local.x;
				this.scaleHandle.y = y + local.y;
				local = MathUtils.rotate(w, 0, this.worldRotation);
				this.scaleXHandle.x = x + local.x;
				this.scaleXHandle.y = y + local.y;
				local = MathUtils.rotate(0, h, this.worldRotation);
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
					this.worldX - this.boxWidth, this.worldY - this.boxHeight,
					this.worldX + this.boxWidth, this.worldY + this.boxHeight
				);
			}

			if(this.visible && drawList && this.worldAABB.intersects(viewport))
			{
				drawList.add(this);
			}
		}

		public drawControls(ctx:CanvasRenderingContext2D, worldScale:number, viewport:AABB)
		{
			if(!this.visible || !this.worldAABB.intersects(viewport)) return;

			if(this.drawOutline || this.selected || this.highlighted)
			{
				ctx.save();

				const scaleX = this.scaleX * worldScale;
				const scaleY = this.scaleY * worldScale;
				const w = this.boxWidth * 0.5;
				const h = this.boxHeight * 0.5;

				ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
				ctx.rotate(this.worldRotation);
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
				this.rotationHandle = new Handle(this, 'rotation', Config.handleRadius, HandleShape.CIRCLE, HandleType.ROTATION, Config.handle);
				this.handles.push(this.rotationHandle);
			}
			else if(this.rotationHandle)
			{
				this.handles.splice(this.handles.indexOf(this.rotationHandle), 1);
				this.rotationHandle = null;
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
				this.scaleHandle = new Handle(this, 'scale', Config.handleRadius, HandleShape.SQUARE, HandleType.SCALE, Config.handle);
				this.scaleXHandle = new Handle(this, 'scaleX', Config.handleRadius, HandleShape.SQUARE, HandleType.AXIS, Config.handle);
				this.scaleYHandle = new Handle(this, 'scaleY', Config.handleRadius, HandleShape.SQUARE, HandleType.AXIS, Config.handle);
				this.handles.push(this.scaleHandle);
				this.handles.push(this.scaleXHandle);
				this.handles.push(this.scaleYHandle);
			}
			else
			{
				this.handles.splice(this.handles.indexOf(this.scaleHandle), 1);
				this.scaleHandle = null;
				this.handles.splice(this.handles.indexOf(this.scaleHandle), 1);
				this.scaleXHandle = null;
				this.handles.splice(this.handles.indexOf(this.scaleYHandle), 1);
				this.scaleYHandle = null;
			}
		}

	}

}