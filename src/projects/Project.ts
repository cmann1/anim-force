namespace app.projects
{

	import Model = app.model.Model;

	export class Project
	{

		public isNew:boolean = true;

		public name:string;
		public activeModel:Model = null;
		public models:Model[] = [];

		public id = null;
		public rev = null;

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
			var data:any = {
				name: this.name,
				models: [],
				activeModel: -1,
				date: new Date().toJSON(),
				viewport: App.getViewport().save()
			};

			if(this.id)
				data._id = this.id;
			if(this.rev)
				data._rev = this.rev;

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

			if(data._id)
			{
				project.id = data._id;
				project.rev = data._rev;
			}

			for(var modelData of data.models)
			{
				project.addModel(new Model().load(data.asLoadData(modelData)));
			}

			if(!project.models.length)
			{
				project.addModel(new Model());
			}

			var viewportData = data.asLoadData('viewport');
			App.getViewport().load(viewportData);

			project.isNew = false;
			return project;
		}

	}

}