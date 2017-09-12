namespace app.projects
{

	import Model = app.model.Model;

	export class Project
	{

		public name:string;
		public activeModel:Model = null;
		public models:Model[] = [];

		constructor(name:string)
		{
			this.name = name;
		}

		public addModel(model:Model)
		{
			this.models.push(model);

			if(!this.activeModel)
			{
				this.activeModel = model;
			}
		}

		public save():any
		{
			var data = {
				name: this.name,
				models: [],
				activeModel: -1
			};

			if(this.activeModel)
			{
				data.activeModel = this.models.indexOf(this.activeModel);
			}

			for(var model of this.models)
			{
				data.models.push(model.save());
			}

			return data;
		}

	}

}