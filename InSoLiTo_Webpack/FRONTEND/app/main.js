'use strict';

// Style 
import './styles/style.css';
import 'jquery-ui/themes/base/theme.css';


// Dependencies
import 'jquery';
import $ from 'jquery-ui';
import {NeoVis} from 'neovis.js/dist/neovis.js';




var Viz;
window.onload = function draw() {
	var config = {
		container_id: 'Viz',
		neo4j: {
			server_url: 'bolt://localhost:7687',
			server_user: 'neo4j',
			server_password: ''
		},
		visConfig: {
			enabled:false,
			layout: {
				randomSeed: 34
			},
			physics: {
				forceAtlas2Based: {
					gravitationalConstant: -200,
					//                             centralGravity: 0.005,
					springLength: 400,
					springConstant: 0.36,
					avoidOverlap: 1
				},
				maxVelocity: 30,
				solver: 'forceAtlas2Based',
				timestep: 1,
				stabilization: {
					enabled: true,
					iterations: 2000,
					updateInterval: 25,
					fit:true
				},

			},
			interaction: {
				tooltipDelay: 200,
				navigationButtons: true,
				keyboard: true
			},
			nodes: {
				shapeProperties: {
					interpolation: false    // 'true' for intensive zooming
				}
			}
		},
		labels: {
			Publication: {
				label: 'subtitle',
				group: 'community',
				[NeoVis.NEOVIS_ADVANCED_CONFIG]: {
					static: {
						image: '{{url_for("static", filename="paper_centered_sm.png")}}',
						shape: 'circularImage'
						//                                 color: "#97c2fc",
					},
					function: {
						title: (props) => NeoVis.objectToTitleHtml(props, ['title', 'year'])
					}
				},
			},
			InferedTool: {
				label: 'name',
				group: 'community',
				[NeoVis.NEOVIS_ADVANCED_CONFIG]: {
					static: {
						image: '{{url_for("static", filename="tool_centered_sm.png")}}',
						shape: 'circularImage'
					}
				}
			},
			Database: {
				label: 'name',
				//value: "pageRank",
				group: 'community',
				[NeoVis.NEOVIS_ADVANCED_CONFIG]: {
					static: {
						image: '{{url_for("static", filename="database_centered_sm.png")}}',
						shape: 'circularImage'
					}
				}
			}
		},
		relationships: {
			//                     METAOCCUR: {
			//                         value: "times",
			//                         title: "year"
			//                     },
			METAOCCUR_ALL: {
				value: 'times'
			}
		},
		arrows: false,
	};
	Viz = new NeoVis.default(config);
	Viz.render();

}


var myCanvas = document.getElementById('myCanvas');
// myCanvas.width = 500;
// myCanvas.height = 300;


function drawLine(ctx, startX, startY, endX, endY, color) {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	ctx.stroke();
	ctx.restore();
}

function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color) {
	ctx.save();
	ctx.fillStyle = color;
	ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
	ctx.restore();
}

var Barchart = function (options) {
	this.options = options;
	this.canvas = options.canvas;
	this.ctx = this.canvas.getContext('2d');
	this.colors = options.colors;

	this.draw = function () {
		var maxValue = 0;
		for (var categ in this.options.data) {
			maxValue = Math.max(maxValue, this.options.data[categ]);
		}
		var canvasActualHeight = this.canvas.height - this.options.padding * 2;
		var canvasActualWidth = this.canvas.width - this.options.padding * 2;

		//drawing the grid lines
		var gridValue = 0;
		while (gridValue <= maxValue) {
			var gridY = canvasActualHeight * (1 - gridValue / maxValue) + this.options.padding;
			drawLine(
				this.ctx,
				0,
				gridY,
				this.canvas.width,
				gridY,
				this.options.gridColor
			);

			//writing grid markers
			this.ctx.save();
			this.ctx.fillStyle = this.options.gridColor;
			//             this.ctx.font = "bold 10px Arial";
			//             this.ctx.fillText(gridValue, 10,gridY - 2);
			this.ctx.restore();

			gridValue += this.options.gridScale;
		}

		//drawing the bars
		var barIndex = 0;
		var numberOfBars = Object.keys(this.options.data).length;
		var barSize = (canvasActualWidth) / numberOfBars;

		for (categ in this.options.data) {
			var val = this.options.data[categ];
			var barHeight = Math.round(canvasActualHeight * val / maxValue);
			drawBar(
				this.ctx,
				this.options.padding + barIndex * barSize,
				this.canvas.height - barHeight - this.options.padding,
				barSize,
				barHeight,
				this.colors[barIndex % this.colors.length]
			);

			barIndex++;
		}
	}
}


//var OccurData = document.getElementById('script-vars');

var OccurData;
var ToolTopicData;
export function flaskdata(data, type) {
	if (type==='ToolTopicData'){
		ToolTopicData = data;
		}
	else{
		OccurData = data;
		}
}
export function hola(){
	alert('hola');
	}

console.log(OccurData);

var myBarchart = new Barchart(
	{
		canvas: myCanvas,
		padding: 0,
		data: OccurData,
		colors: ['#36aaf7']
	}
);
myBarchart.draw();



function logslider(position) {
	// position will be between 0 and 100
	var minp = 0;
	var maxp = 100;

	// The result should be between 100 an 10000000
	var minv = Math.log(parseInt(Object.keys(OccurData)[0]));
	var maxv = Math.log(parseInt(Object.keys(OccurData)[Object.keys(OccurData).length - 1]));

	// calculate adjustment factor
	var scale = (maxv - minv) / (maxp - minp);

	return Math.trunc(Math.exp(minv + scale * (position - minp)));
}

$(function () {
	$('#slider-range').slider({
		range: true,
		min: 0,
		max: 100,
		values: [0, 100],
		slide: function (event, ui) {
			$('#amount').val(logslider(ui.values[0]) + ' - ' + logslider(ui.values[1]));
		}
	});
	$('#amount').val(logslider($('#slider-range').slider('values', 0)) +
		' - ' + logslider($('#slider-range').slider('values', 1)));
});


//var ToolTopicData = document.getElementById('script-vars');


console.log(ToolTopicData);

$(function () {
	$('#tooltopic_autocomplete').autocomplete({
		source: ToolTopicData,
		minLength: 1,
		select: function (event, ui) {

			var name = ui.item.value;
			var id = ui.item.identificator;

			var cypherMin = $('#amount').val().substr(0, $('#amount').val().indexOf('-') - 1);
			var cypherMax = $('#amount').val().substr($('#amount').val().indexOf('-') + 2, $('#amount').val().length);

			console.log(ui.item);
			if (ui.item.labelnode === 'Topic') {
				AddTopic(name, id, cypherMin, cypherMax);

			} else {
				AdddNode(name, id, cypherMin, cypherMax);
			}
			$(this).val('');
			return false;

		},
		html: true,
		open: function (event, ui) {
			$('.ui-autocomplete').css('z-index', 1000);

		}
	})
	.autocomplete('instance')._renderItem = function (ul, item) {
		if (item.labelnode === 'InferedTool'){
			return $('<li><div><img src="../static/tool_centered_sm.png"><span>' + item.value + '</span></div></li>').appendTo(ul);
		}
		else if (item.labelnode === 'Database'){
			return $('<li><div><img src="../static/database_centered_sm.png"><span>' + item.value + '</span></div></li>').appendTo(ul);

		} else {
			return $('<li><div><img src="../static/topic_centered_sm.png"><span>' + item.value + '</span></div></li>').appendTo(ul);

		}
	};
});



function RemoveLegend(){
	console.log('removing legend');
	const list = document.querySelector('#legend ul');
	list.innerHTML = '';
}

function ReturnClusters() {
	var net = Viz.network.body;
	var allNodes = net.nodeIndices;

	var dict_clusters = {};
		
	allNodes.forEach((node) => {
		var comm_id = net.nodes[node].options.raw.properties.community;
		var color_id = net.nodes[node].options.color.background;
		console.log(color_id);
		if (dict_clusters.hasOwnProperty(comm_id)){
				dict_clusters[comm_id].count += 1;
		}
		else{
			dict_clusters[comm_id] = {count : 1, cTopic:{}, color: color_id};
		}
		if (net.nodes[node].options.raw.properties.hasOwnProperty('topiclabel')){
			var listTopics = net.nodes[node].options.raw.properties.topiclabel;
			listTopics.forEach((topic) =>{
				if(dict_clusters[comm_id].cTopic.hasOwnProperty(topic)){
					dict_clusters[comm_id].cTopic[topic] += 1;
				} 
				else {
					dict_clusters[comm_id].cTopic[topic] = 1;
				}
			});
		}
		
	});
	console.log(dict_clusters);
	return dict_clusters;
}


async function AddLegend(ColorTool) {
	const list = document.querySelector('#legend ul');
	console.log('Addlegend');


	// create elements
	if(ColorTool==='Normal'){
		// var value = "Green for Databases";
		console.log('normal');
		list.innerHTML = '<div id="legendnormal"><img style="background-color: #add8e6;" src="../static/tool_centered_sm.png"><span> Tools </span></div>';
		list.innerHTML +='<div id="legendnormal"><img style="background-color: #FB7E81;" src="../static/paper_centered_sm.png"><span> Articles </span></div>';
		list.innerHTML +='<div id="legendnormal"><img style="background-color: #b2e6ad;" src="../static/database_centered_sm.png"><span> Databases </span></div>';

	}
	else{

		list.innerHTML = ' <div>Each color different cluster</div>';
		console.log('cluster');
		await new Promise(r => setTimeout(r, 100));
		var dict_clusters = ReturnClusters();
		
		for(const [ckey, cvalue] of Object.entries(dict_clusters)) {
			if(cvalue.count >9){
				let maxKey = [];
				let maxValue = 0;
				for(const [tkey, tvalue] of Object.entries(cvalue.cTopic)) {
					if(tvalue > maxValue) {
						maxKey = [tkey];
						maxValue = tvalue;
					}
					else if(tvalue === maxValue){
						maxKey.push(tkey);
					}
				}
				console.log(maxKey, maxValue, cvalue.color);

				list.innerHTML += '<div><div id="circle" style="background-color:' + cvalue.color + ';"></div><span>' + maxKey.join(' / ') + '</span></div>';
			}
		}


	}
}


function StoreClusterColor(){
	setTimeout(function() {
		var net = Viz.network.body;
		var allNodes = net.nodeIndices;
		
		allNodes.forEach((node) => {
			if (net.nodes[node].options.hasOwnProperty('colorcluster')){
				return true;
			}
			var obj_cluster ={colorcluster :{background:null, border:null, highlight:{background: null, border:null}, hover:{background: null, border:null}}};
			obj_cluster.colorcluster.background = net.nodes[node].options.color.background;
			obj_cluster.colorcluster.border = net.nodes[node].options.color.border
			obj_cluster.colorcluster.highlight.background = net.nodes[node].options.color.highlight.background
			obj_cluster.colorcluster.highlight.border = net.nodes[node].options.color.highlight.border
			obj_cluster.colorcluster.hover.background = net.nodes[node].options.color.hover.background
			obj_cluster.colorcluster.hover.border = net.nodes[node].options.color.hover.border
			
			var obj_normal = {colornormal :{background:null, border:null, highlight:{background: null, border:null}, hover:{background: null, border:null}}};
			if (net.nodes[node].options.raw.labels[0]==='InferedTool'){
				obj_normal.colornormal.background='#add8e6'
				obj_normal.colornormal.border='#6bc5e3'
				obj_normal.colornormal.highlight.background='#add8e6'
				obj_normal.colornormal.highlight.border='#6bc5e3'
				obj_normal.colornormal.hover.background='#add8e6'
				obj_normal.colornormal.hover.border='#6bc5e3'
			}
			else if (net.nodes[node].options.raw.labels[0]==='Database'){
				obj_normal.colornormal.background='#b2e6ad'
				obj_normal.colornormal.border='#4ed442'
				obj_normal.colornormal.highlight.background='#b2e6ad'
				obj_normal.colornormal.highlight.border='#4ed442'
				obj_normal.colornormal.hover.background='#b2e6ad'
				obj_normal.colornormal.hover.border='#4ed442'
			}
			else{
				obj_normal.colornormal.background='#FB7E81'
				obj_normal.colornormal.border='#FA0A10'
				obj_normal.colornormal.highlight.background='#FB7E81'
				obj_normal.colornormal.highlight.border='#FA0A10'
				obj_normal.colornormal.hover.background='#FB7E81'
				obj_normal.colornormal.hover.border='#FA0A10'
			}
			net.nodes[node].options = Object.assign(net.nodes[node].options, obj_cluster)
			net.nodes[node].options = Object.assign(net.nodes[node].options, obj_normal)
		});
	});

}

function ClusterMode(){
	var option_radio = document.querySelector('input[name="cluster_mode"]:checked');
	console.log(option_radio.value);
	var list_changes = [];
	if (option_radio.value === 'Cluster'){
		console.log('Cluster2')
		AddLegend('Cluster'); 
		var net = Viz.network.body;
		var allNodes = net.nodeIndices;
		allNodes.forEach((node) => {
			var change_node = {
				id:node,
				color: {
					background: net.nodes[node].options.colorcluster.background,
					border: net.nodes[node].options.colorcluster.border,
					highlight: {
						border: net.nodes[node].options.colorcluster.highlight.border,
						background: net.nodes[node].options.colorcluster.highlight.background
					},
					hover : {
						border: net.nodes[node].options.colorcluster.hover.border,
						background: net.nodes[node].options.colorcluster.hover.background
					}
				}
			};
			list_changes.push(change_node);
		});

	}
	else{
		console.log('Normal');
		AddLegend('Normal'); 
		var net = Viz.network.body;
		var allNodes = net.nodeIndices;
		allNodes.forEach((node) => {
			var change_node = {
				id:node,
				color: {
					background: net.nodes[node].options.colornormal.background,
					border: net.nodes[node].options.colornormal.border,
					highlight: {
						border: net.nodes[node].options.colornormal.highlight.border,
						background: net.nodes[node].options.colornormal.highlight.background
					},
					hover : {
						border: net.nodes[node].options.colornormal.hover.border,
						background: net.nodes[node].options.colornormal.hover.background
					}
				}
			};
			list_changes.push(change_node);
		});
	}
	Viz.nodes.update(list_changes);
} 

$('input[type=radio][name=cluster_mode]').change(function(){
	ClusterMode();
});

async function AddTool(NameTool, c_min, c_max) {

	var cypher_query = 'MATCH (i)-[o:METAOCCUR_ALL]-(p) where i.name="' + NameTool + '" and o.times>' + c_min + ' and o.times<' + c_max + ' return i,o,p order by o.times';

	Viz.updateWithCypher(cypher_query);

	const list = document.querySelector('#loading');
	const Loadingtext = document.createElement('span');
	Loadingtext.textContent = 'Loading...';
	Loadingtext.classList.add('loadingbar');
	list.appendChild(Loadingtext);


	console.log(cypher_query);
	await new Promise(r => setTimeout(r, 500));
	console.log(Viz.nodes.length);
	if (Viz.nodes.length === 0) {
		alert('No results found. Try again!');
	}
	algo(c_min, c_max);
	await new Promise(r => {
		StoreClusterColor();
		WaitAddTool();
	});



};

function AddLabelMenu(name, id) {
	const list = document.querySelector('#tools-list ul');

	// create elements
	const value = name
	const li = document.createElement('li');
	const ToolName = document.createElement('span');
	//   const deleteBtn = document.createElement('span');

	// add text content
	ToolName.textContent = value;
	//   deleteBtn.textContent = 'delete';
	// add classes
	ToolName.classList.add('delete');
	ToolName.value = id;

	// append to DOM
	li.appendChild(ToolName);
	//   li.appendChild(deleteBtn);
	list.appendChild(li);
	//list.insertBefore(li, list.querySelector('li:first-child'));

	// delete books
	list.addEventListener('click', (e) => {
		if (e.target.className === 'delete') {
			console.log('Removing Tool');
			const li = e.target.parentElement;
			li.parentNode.removeChild(li);
			var IdTool = e.target.value;
			console.log(IdTool);
			if (Array.isArray(IdTool)) {
				console.log('Remove topic option');

				IdTool.forEach((tool) => {
					console.log(tool);
					if (Viz.nodes.get(tool) !== null) {
						Viz.network.unselectAll();
						var ConnectedNodes = Viz.network.getConnectedNodes(tool);

						var UnconnectedNodes = [];
						ConnectedNodes.forEach((node) => {
							//                             if(Viz.network.getConnectedEdges(node).length===1){
							UnconnectedNodes.push(node);
							//                             };
						});
						Viz.network.selectNodes([tool].concat(UnconnectedNodes));
						Viz.network.deleteSelected();
						
					}
				});
				AddLegend('Cluster');
			}
			else {
				console.log('Option 2');
				Viz.network.unselectAll();
				var ConnectedNodes = Viz.network.getConnectedNodes(IdTool);

				var UnconnectedNodes = [];
				ConnectedNodes.forEach((node) => {
					if (Viz.network.getConnectedEdges(node).length === 1) {
						UnconnectedNodes.push(node);
					};
				});
				Viz.network.selectNodes([e.target.value].concat(UnconnectedNodes));
				Viz.network.deleteSelected();
				AddLegend('Cluster');
			}
		};
	});
}





function algo(c_min, c_max) {

	Viz.network.on('selectNode', (e1) => {
		console.log('selecting');
		//         Viz.network.deleteNode(65086);
		console.log(e1);
		Menu(e1, c_min, c_max);
	});

	Viz.network.on('deselectNode', (e1) => {
		console.log('deselect');
		var contextMenu = document.getElementById('context-menu');
		contextMenu.innerHTML = '';
	});

	Viz.network.on('stabilizationProgress', (e1)=>{
		console.log(e1);
	})
}



function RemoveAllToolsMenu() {
	const list = document.querySelector('#tools-list ul');
	list.innerHTML = '';
	RemoveLegend();
}


function ExpandNode(NameTool, NodeID, c_min, c_max) {

	var list = document.getElementsByClassName('delete');
	var isInMenu = false;

	Array.prototype.forEach.call(list, function (tool) {
		console.log(tool);

		if (tool.textContent === NameTool) {
			console.log(NameTool);
			isInMenu = true;
		}
	});
	if (isInMenu === false) {
		console.log(isInMenu);
		AddTool(NameTool, c_min, c_max)
		AddLabelMenu(NameTool, NodeID)
	}
}



function AdddNode(NameTool, NodeID, c_min, c_max) {

	var list = document.getElementsByClassName('delete');
	var isInMenu = false;

	Array.prototype.forEach.call(list, function (tool) {
		console.log(tool);

		if (tool.textContent === NameTool) {
			console.log(NameTool);
			isInMenu = true;
		}
	});
	if (isInMenu === false) {
		console.log(isInMenu);
		AddTool(NameTool, c_min, c_max)
		AddLabelMenu(NameTool, NodeID)
	}
}



function CenterNode(name, node_id, c_min, c_max) {


	var list = document.getElementsByClassName('delete');
	var isInMenu = false;

	Array.prototype.forEach.call(list, function (tool) {
		console.log(tool);
		if (tool.textContent !== name) {
			console.log(tool.parentElement);

			const li = tool.parentElement;
			li.parentNode.removeChild(li);
			var IdTool = tool.value;
			Viz.network.unselectAll();
			var ConnectedNodes = Viz.network.getConnectedNodes(IdTool);

			var UnconnectedNodes = [];
			ConnectedNodes.forEach((node) => {
				if (Viz.network.getConnectedEdges(node).length === 1) {
					UnconnectedNodes.push(node);
				};
			});
			Viz.network.selectNodes([tool.value].concat(UnconnectedNodes));
			Viz.network.deleteSelected();
		}
		else {
			isInMenu = true;
		}
	});
	if (isInMenu === false) {
		Viz.reload();
		AddTool(name, c_min, c_max)
		AddLabelMenu(name, node_id)
	}
}



async function AddTopicNodes(NameTopic, c_min, c_max) {

	var cypher_query = 'match (n)-[:TOPIC]->(k:Keyword)-[:SUBCLASS*]->(k2:Keyword) where k2.label="' + NameTopic + '" or k.label="' + NameTopic + '" with distinct n with collect(n) as nt unwind nt as nt1 unwind nt as nt2 match (nt1)-[m:METAOCCUR_ALL]-(nt2) return nt1,m,nt2';

	Viz.updateWithCypher(cypher_query);
	console.log(cypher_query);

	const list = document.querySelector('#loading');
	const Loadingtext = document.createElement('span');
	Loadingtext.textContent = 'Loading...';
	Loadingtext.classList.add('loadingbar');
	list.appendChild(Loadingtext);

	await new Promise(r => setTimeout(r, 5000));
	console.log(Viz.nodes.length);
	if (Viz.noes.length === 0) {
		alert('No results found. Try again!');
	}
	algo(c_min, c_max);

	await new Promise(r => {
		StoreClusterColor();
		WaitAddTool();
	});
}

function AddTopicLabelMenu(NameTopic, id) {
	const list = document.querySelector('#tools-list ul');

	// create elements
	const value = NameTopic
	const li = document.createElement('li');
	const ToolName = document.createElement('span');
	//   const deleteBtn = document.createElement('span');

	// add text content
	ToolName.textContent = value;
	//   deleteBtn.textContent = 'delete';
	// add classes
	ToolName.classList.add('delete');

	ToolName.value = id;

	// append to DOM
	li.appendChild(ToolName);
	//   li.appendChild(deleteBtn);
	list.appendChild(li);
	//list.insertBefore(li, list.querySelector('li:first-child'));

	// delete books
	list.addEventListener('click', (e) => {
		console.log('removing topic')
		if (e.target.className === 'delete') {
			const li = e.target.parentElement;
			li.parentNode.removeChild(li);
			var IdTool = e.target.value;
			console.log(IdTool);
			IdTool.forEach((tool) => {
				console.log(tool);
				if (Viz.nodes.get(tool) !== null) {
					Viz.network.unselectAll();
					var ConnectedNodes = Viz.network.getConnectedNodes(tool);

					var UnconnectedNodes = [];
					ConnectedNodes.forEach((node) => {
						//                             if(Viz.network.getConnectedEdges(node).length===1){
						UnconnectedNodes.push(node);
						//                             };
					});
					Viz.network.selectNodes([tool].concat(UnconnectedNodes));
					Viz.network.deleteSelected();
				}
			});
			AddLegend('Cluster');
		};
	});
}

function AddTopic(NameTopic, id, c_min, c_max) {

	var list = document.getElementsByClassName('delete');
	var isInMenu = false;

	Array.prototype.forEach.call(list, function (tool) {
		console.log(tool);

		if (tool.textContent === NameTopic) {
			console.log(NameTopic);
			isInMenu = true;
		}
	});
	if (isInMenu === false) {
		console.log(isInMenu);
		AddTopicNodes(NameTopic, c_min, c_max);
		AddTopicLabelMenu(NameTopic, id);
	}
}


function Menu(e1, c_min, c_max) {
	if (e1.nodes.length === 1) {
		var node_id = e1.nodes[0];
		if (Viz.network.body.nodes[node_id].options.raw.labels[0] === 'Publication') {
			return;
		}
		console.log(node_id);
		console.log(Viz.network.body.nodes[node_id]);

		// Display menu
		const contextMenu = document.getElementById('context-menu');
		contextMenu.innerHTML = '<div class="topicmenu" id="topic"></div><div class="item" id = "webpage"></div><div class="item" id="center"></div><div class="item" id="expand"></div>'
		const scope = document.querySelector('body');

		var name = Viz.network.body.nodes[node_id].options.raw.properties.name;
		console.log(name);

		var label = Viz.network.body.nodes[node_id].options.raw.properties.label;
		console.log(label);


		if ('topiclabel' in Viz.network.body.nodes[node_id].options.raw.properties) {
			var topiclabel = Viz.network.body.nodes[node_id].options.raw.properties.topiclabel;
			console.log(topiclabel.length);

			var topicedam = Viz.network.body.nodes[node_id].options.raw.properties.topicedam;
			console.log(topicedam);

			document.getElementById('topic').innerHTML = '';
			for (var i = 0; i < topiclabel.length; i++) {
				document.getElementById('topic').innerHTML += '<button onclick="AddTopic(&#34;' + topiclabel[i] + '&#34;, &#34;' + c_min + '&#34;, &#34;' + c_max + '&#34;)" >' + topiclabel[i] + '</button>';
			}
		}



		document.getElementById('webpage').innerHTML = '<button onclick="window.open(&#34;https://openebench.bsc.es/tool/' + label + '&#34; , &#34;_blank&#34; )">Webpage</button>';

		document.getElementById('center').innerHTML = '<button onclick="CenterNode(&#34;' + name + '&#34;, &#34;' + node_id + '&#34;, &#34;' + c_min + '&#34;, &#34;' + c_max + '&#34;)">Center</button>';

		document.getElementById('expand').innerHTML = '<button onclick="ExpandNode(&#34;' + name + '&#34;, &#34;' + node_id + '&#34;, &#34;' + c_min + '&#34;, &#34;' + c_max + '&#34;)">Expand</button>';

		const normalizePozition = (mouseX, mouseY) => {
			// ? compute what is the mouse position relative to the container element (scope)
			let {
				left: scopeOffsetX,
				top: scopeOffsetY,
			} = scope.getBoundingClientRect();

			scopeOffsetX = scopeOffsetX < 0 ? 0 : scopeOffsetX;
			scopeOffsetY = scopeOffsetY < 0 ? 0 : scopeOffsetY;

			const scopeX = mouseX - scopeOffsetX;
			const scopeY = mouseY - scopeOffsetY;

			// ? check if the element will go out of bounds
			const outOfBoundsOnX =
				scopeX + contextMenu.clientWidth > scope.clientWidth;

			const outOfBoundsOnY =
				scopeY + contextMenu.clientHeight > scope.clientHeight;

			let normalizedX = mouseX;
			let normalizedY = mouseY;

			// ? normalize on X
			if (outOfBoundsOnX) {
				normalizedX =
					scopeOffsetX + scope.clientWidth - contextMenu.clientWidth;
			}

			// ? normalize on Y
			if (outOfBoundsOnY) {
				normalizedY =
					scopeOffsetY + scope.clientHeight - contextMenu.clientHeight;
			}

			return { normalizedX, normalizedY };
		};

		scope.addEventListener('contextmenu', (event) => {
			event.preventDefault();


			const { clientX: mouseX, clientY: mouseY } = event;

			const { normalizedX, normalizedY } = normalizePozition(mouseX, mouseY);

			contextMenu.classList.remove('visible');

			contextMenu.style.top = `${normalizedY}px`;
			contextMenu.style.left = `${normalizedX}px`;




			setTimeout(() => {
				contextMenu.classList.add('visible');
			});
		});

		scope.addEventListener('click', (e) => {
			// ? close the menu if the user clicks outside of it
			if (e.target.offsetParent !== contextMenu) {
				contextMenu.classList.remove('visible');
			}
		});
	}
}



function AddLoadingTool (){ 
		setTimeout(function () {
			ClusterMode();

		})
		var loadingid = document.querySelector('.loadingbar');
		console.log(loadingid);
		Viz.stabilize();


		// loadingid.parentElement.removeChild(loadingid);
		Viz.network.off('afterDrawing', AddLoadingTool);
		// Viz.network.fit();
		Viz.stabilize(100);
		loadingid.parentNode.removeChild(loadingid);

	};

function WaitAddTool(){
	setTimeout(function(){
		console.log('add stabilize')
		Viz.network.stabilize(100);
		Viz.network.on('afterDrawing', AddLoadingTool);

	})
}


const res = document.getElementById('reset');

// Reset All Neo4j
res.addEventListener('click', (e) => {
	Viz.reload();
	RemoveAllToolsMenu();

});



const sta = document.getElementById('stabilize');

// Stabilize the network
	sta.addEventListener('click', (e) => {
	Viz.stabilize();
});