namespace app
{

	import IBaseDoc = pouchDB.IBaseDoc;
	import EventDispatcher = app.events.EventDispatcher;
	import Event = app.events.Event;

	export class Config
	{

		private static settingsDb:pouchDB.IPouchDB;

		static readonly change:EventDispatcher<any> = new EventDispatcher<any>();

		static showFps = true;
		static showControls = true;
		static drawAABB = false;
		static drawGrid = true;

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

		static init(callback:() => void)
		{
			var db = Config.settingsDb = new PouchDB('app-settings', {adapter: 'idb', revs_limit: 1, auto_compaction: true});
			db.allDocs({include_docs: true}).then(function(results){
				for(var data of results.rows)
				{
					Config[data.id] = (<any> data.doc).value;
				}
			}).then(callback);
		}

		static set(name:string, value:any)
		{
			if(Config[name] == value) return value;

			Config.settingsDb.get(name).catch(function(err){
				if(err.name === 'not_found')
				{
					return {_id: name, value: value};
				} else { // hm, some other error
					throw err;
				}
			}).then(function(doc:any){
				doc.value = value;
				Config.settingsDb.put(doc);
			});

			Config[name] = value;
			Config.change.dispatch(null, new Event(name));

			return value;
		}

	}

}