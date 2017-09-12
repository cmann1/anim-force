namespace app
{

	export class Config
	{

		private static bgGradientTop = '';

		static showFps = true;
		static drawAABB = false;
		static drawControls = true;

		static text = '#444';
		static font = 'monospace';

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
		static boneStretchHandleDist = 20;

		static handleRadius = 5;
		static subHandleRadius = 4;

		static node = '#FBFBFB';
		static nodeBottom = '#F0F0F0';
		static nodeBorder = '#DCDCDC';
		static line = '#999';

		static nodeHeight = 29;
		static frameWidth = 15;

	}

}