namespace app
{

	export class Config
	{

		static drawAABB = true;

		static control = '#333';
		static handle = '#5c7ecd';
		static selected = '#CD3D51';
		static highlighted = '#de7777';
		static outline = '#eee';
		static link = '#999';

		static AABB = '#F00';
		static childrenAABB = '#0F0';
		static boneAABB = '#00F';

		static interactionTolerance = 2;

		static boneThickness = 3;
		static boneClick = Config.boneThickness + Config.interactionTolerance;
		static boneStretchHandleDist = 20;

		static handleRadius = 4;
		static handleClick = Config.handleRadius + Config.interactionTolerance;
		static subHandleRadius = 3;
		static subHandleClick = Config.subHandleRadius + Config.interactionTolerance;

	}

}