namespace app.exporters
{

	import Model = app.model.Model;
	import Sprite = app.model.Sprite;
	import Node = app.model.Node;

	export class SpriteGroupExporter extends Exporter
	{

		public exportModel(model:Model):string
		{
			const varName = model.name.toVarName() + '_spr';
			const alignX = 0.5;
			const alignY = 0.5;

			var nodes:Node[] = model.getNodeList();

			var output = `sprite_group ${varName};\n`;

			for(var node of nodes)
			{
				if(node instanceof Sprite)
				{
					var sprite:Sprite = <Sprite> node;
					if(sprite.asset)
					{
						output += `${varName}.add_sprite(` +
							`'${sprite.asset.spriteSetName}', '${sprite.asset.spriteName}',` +
							`${alignX}, ${alignY},` +
							`${sprite.worldX}, ${sprite.worldY}, ${sprite.worldRotation * Math.RAD_TO_DEG},` +
							`${sprite.scaleX}, ${sprite.scaleY}, 0xFFFFFFFF,` +
							`${sprite.frame}, ${sprite.palette},` +
							`${sprite.layer}, ${sprite.subLayer});\n`;
					}
				}
			}

			output += `${varName}.draw(layer, sub_layer, x, y, rot, scale);\n`;

			return output;
		}

	}

}