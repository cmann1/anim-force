namespace app
{

	export class Config
	{

		static drawAABB = false;

		static control = '#333';
		static selected = '#CD3D51';
		static highlighted = '#de7777';

		static interactionTolerance = 2;

		static bone = '#eee';
		static boneThickness = 3;
		static boneEndPointRadius = 4;

		static AABB = '#F00';
		static childrenAABB = '#0F0';
		static boneAABB = '#00F';

		static boneClick = Config.boneThickness + Config.interactionTolerance;
		static boneEndPointClick = Config.boneEndPointRadius + Config.interactionTolerance;

	}

}