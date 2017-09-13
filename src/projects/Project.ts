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
				activeModel: -1,
				date: new Date().toJSON()
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

		public static load(data:LoadData):Project
		{
			var project:Project = new Project(data.get('name'));

			for(var modelData of data.models)
			{
				project.addModel(Model.load(data.asLoadData(modelData)));
			}

			if(!project.models.length)
			{
				project.addModel(new Model());
			}

			return project;
		}

	}

}