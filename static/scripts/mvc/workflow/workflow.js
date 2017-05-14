define([],function(){var a=Backbone.View.extend({initialize:function(){this.setElement("<div/>"),this.render()},render:function(){var a=this,b=3;$.getJSON(Galaxy.root+"api/workflows/",function(c){var d=null;a.$el.empty().append(a._templateHeader()),a.build_messages(a),d=a.$el.find(".user-workflows"),d.append(a._templateActionButtons()),c.length>0?(d.append(a._templateWorkflowTable(a,c)),a.adjust_actiondropdown(d),_.each(c,function(b){a.confirm_delete(a,b)}),a.search_workflow(a,a.$el.find(".search-wf"),a.$el.find(".workflow-search tr"),b)):d.append(a._templateNoWorkflow())})},build_messages:function(a){var b=a.$el.find(".response-message"),c=a.get_querystring("status"),d=a.get_querystring("message");d&&null!==d&&""!==d?(b.addClass(c+"message"),b.html("<p>"+d+"</p>")):b.html("")},confirm_delete:function(a,b){var c=a.$el.find(".link-confirm-"+b.id),d=a.$el.find(".link-confirm-shared-"+b.id);c.click(function(){return confirm("Are you sure you want to delete workflow '"+b.name+"'?")}),d.click(function(){return confirm("Are you sure you want to remove the shared workflow '"+b.name+"'?")})},search_workflow:function(a,b,c,d){b.on("keyup",function(){var a=$(this).val();if(a.length>=d){var b=new RegExp(a,"i");c.hide(),c.filter(function(){return b.test($(this).text())}).show()}else c.show()})},get_querystring:function(a){return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]"+encodeURIComponent(a).replace(/[\.\+\*]/g,"\\$&")+"(?:\\=([^&]*))?)?.*$","i"),"$1"))},adjust_actiondropdown:function(a){a.on("show.bs.dropdown",function(){a.css("overflow","inherit")}),a.on("hide.bs.dropdown",function(){a.css("overflow","auto")})},register_configure_menu:function(a){a.$el.find(".configure-wf-menu").click(function(){})},_templateNoWorkflow:function(){return'<div class="wf-nodata"> You have no workflows. </div>'},_templateActionButtons:function(){return'<ul class="manage-table-actions"><li><input class="search-wf form-control" type="text" autocomplete="off" placeholder="search for workflow..."></li><li><a class="action-button fa fa-plus wf-action" id="new-workflow" title="Create new workflow" href="'+Galaxy.root+'workflow/create"></a></li><li><a class="action-button fa fa-upload wf-action" id="import-workflow" title="Upload or import workflow" href="'+Galaxy.root+'workflow/import_workflow"></a></li></ul>'},_templateWorkflowTable:function(a,b){var c="",d="";return c+='<table class="table colored"><thead><tr class="header"><th class="wf-td">Name</th><th class="wf-td">Owner</th><th class="wf-td"># of Steps</th><th class="wf-td">Published</th></tr></thead>',_.each(b,function(b){d=d+'<tr><td class="wf-td wf-dpd"><div class="dropdown"><button class="menubutton" type="button" data-toggle="dropdown">'+_.escape(b.name)+'<span class="caret"></span></button>'+a._templateActions(b)+"</div></td><td>"+(b.owner===Galaxy.user.attributes.username?"You":b.owner)+'</td><td class="wf-td">'+b.number_of_steps+'</td><td class="wf-td">'+(b.published?"Yes":"No")+"</td></tr>"}),c+'<tbody class="workflow-search">'+d+"</tbody></table>"},_templateActions:function(a){return a.owner===Galaxy.user.attributes.username?'<ul class="dropdown-menu action-dpd"><li><a href="'+Galaxy.root+"workflow/editor?id="+a.id+'">Edit</a></li><li><a href="'+Galaxy.root+"workflow/run?id="+a.id+'" target="galaxy_main">Run</a></li><li><a href="'+Galaxy.root+"workflow/sharing?id="+a.id+'">Share or Download</a></li><li><a href="'+Galaxy.root+"workflow/copy?id="+a.id+'">Copy</a></li><li><a href="'+Galaxy.root+"workflow/rename?id="+a.id+'">Rename</a></li><li><a href="'+Galaxy.root+"workflow/display_by_id?id="+a.id+'">View</a></li><li><a class="link-confirm-'+a.id+'" href="'+Galaxy.root+"workflow/delete?id="+a.id+'">Delete</a></li></ul>':'<ul class="dropdown-menu action-dpd"><li><a href="'+Galaxy.root+"workflow/display_by_username_and_slug?username="+a.owner+"&slug="+a.slug+'">View</a></li><li><a href="'+Galaxy.root+"workflow/run?id="+a.id+'" target="galaxy_main">Run</a></li><li><a href="'+Galaxy.root+"workflow/copy?id="+a.id+'">Copy</a></li><li><a class="link-confirm-shared-'+a.id+'" href="'+Galaxy.root+"workflow/sharing?unshare_me=True&id="+a.id+'">Remove</a></li></ul>'},_templateHeader:function(){return'<div class="page-container"><div class="user-workflows wf"><div class="response-message"></div><h2>Your workflows</h2></div><div class="other-options wf"><h2>Other options</h2><a class="action-button fa fa-cog wf-action" href="'+Galaxy.root+'workflow/configure_menu" title="Configure your workflow menu"><span>Configure your workflow menu</span></a></div></div>'}}),b=Backbone.View.extend({initialize:function(){this.setElement("<div/>"),this.render()},render:function(){var a=this;$.getJSON(Galaxy.root+"api/workflows/configure_workflow_menu/",function(b){var c=b.workflows,d=b.ids_in_menu,e=null;a.$el.empty().append(a._templateConfigWorkflowHeader()),e=a.$el.find(".configure-workflows"),c.length>0?(e.append(a._templateConfigureWorkflow(a,c,d)),a.save_workflow_menu(a),a.make_checked(a,d)):e.append(a._templateNoWorkflow())})},make_checked:function(a,b){$.each(a.$el.find(".wf-config-item"),function(){var a=$(this)[0];_.each(b,function(b){parseInt(a.value)===b&&(a.checked=!0)})})},save_workflow_menu:function(a){var b=a.$el.find(".wf-save-menu");b.click(function(){var b=[];$.each(a.$el.find(".wf-config-item"),function(){var a=$(this)[0];(a.checked||"true"===a.checked)&&b.push(parseInt(a.value))}),$.ajax({type:"PUT",url:Galaxy.root+"api/workflows/configure_workflow_menu/",data:JSON.stringify({workflow_ids:b}),contentType:"application/json"}).done(function(a){window.location=Galaxy.root+"workflow?status="+a.status+"&message="+a.message})})},_templateConfigureWorkflow:function(a,b,c){var d="",e="";return d+='<table class="table colored"><thead><tr class="header"><th class="wf-td">Name</th><th class="wf-td">Owner</th><th class="wf-td"># of Steps</th><th class="wf-td">Show in menu</th></tr></thead>',_.each(b,function(b){e=e+'<tr><td class="wf-td">'+_.escape(b.name)+"</td><td>"+(b.owner===Galaxy.user.attributes.username?"You":b.owner)+'</td><td class="wf-td">'+b.number_of_steps+'</td><td class="wf-td">'+a._templateInputCheckbox(a,b,c)+"</td></tr>"}),d=d+'<tbody class="workflow-config-menu">'+e+"</tbody></table>",d+='<a class="action-button wf-save-menu" href="#" title="Save"><span>Save</span></a>'},_templateNoWorkflow:function(){return'<div class="wf-nodata"> You do not have any accessible workflows. </div>'},_templateInputCheckbox:function(a,b){return'<input type="checkbox" class="wf-config-item" name="workflow_ids" value="'+b.id+'" />'},_templateConfigWorkflowHeader:function(){return'<div class="page-container"><div class="configure-workflows wf"><h2>Configure workflow menu</h2></div></div>'}});return{View:a,Configure_Menu_View:b}});
//# sourceMappingURL=../../../maps/mvc/workflow/workflow.js.map