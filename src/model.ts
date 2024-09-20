const state = new Map();

export const blocks = new Map();

type blocktype = "get" | "var" | "join" | "receive" | "send" | "init" | "split" | "btn" | "log" | "through";

export class Block{
	inputs : Block[];

	input_data : Map<String, any> = new Map();

	outputs : Block[];
	output_list : any[];
	
	id : string;
	fields : any;

	targets : string[] = [];
	state : string[] = [];

	type : blocktype;

	pass_function  : Function = (inp : Map<String, any>) => inp;


	constructor(id : string, fields : any, type : blocktype){
		this.inputs = [];
		this.outputs = [];
		this.id = id;
		this.fields = fields
		this.output_list = []
		this.type = type;
	}


	add_input(input : Block){
		this.inputs.push(input);
			
	}

	add_output(output : Block){
		this.outputs.push(output);
	}


	connect_to_source(source : Block){
		this.inputs.push(source);
		source.outputs.push(this)
	}	


	change_field(targets : string[], _state : string[]){

		if(targets.length != _state.length){
			return
		}	

		for(let i = 0; i < targets.length; i++){
			this.fields[targets[i]] = _state[i];

			

			if(this.type == "init"){
			
				let name = this.fields.input_name;
				let value = this.fields.input_value;


				state.set(name, value)
			}

			if(this.type == "get"){

			}
		}

			
	}

	pipe(value : Map<String, any>, source_id : string){
		
		if(!this.input_data.has(source_id)){
			this.input_data.set(source_id, value);
		}

		if([...this.input_data.keys()].length == this.inputs.length){

			let all_map = new Map();
			[...this.input_data].forEach(([key, value]) => {
					
				[...value].forEach(([key, val]) => {

					all_map.set(key, val)
				})

			})

			let value = this.pass_function(all_map, this.id);

			for(const output of this.outputs){
				output.pipe(value, this.id);
			}


		}
	}
}

export class ThroughBlock extends Block{
	constructor(id : string){
		super(id, {

		}, "through")

		this.pass_function = (inp : Map<String, any>) => {	

			inp.set("pass_through_thing", 42)

			return inp
		
		}
	}
}

export class LogBlock extends Block{

	constructor(id : string){
		super(id, {
			
		}, "log")

		this.pass_function = (inp : Map<String, any>) => {

			console.log(inp)

		}
	}

}

export class JoinBlock extends Block{
	constructor(id : string){
		super(id, {

		}, "join")
	}
}

export class InitBlock extends Block{
	constructor(id : string){
		super(id, {
			input_name : "",
			input_value : ""
		}, "init")

		this.pass_function = (inp : Map<String, any>) => {


			inp.set(this.fields.input_name, this.fields.input_value);
			return inp
		}
	}

	
}

export class ButtonBlock extends Block{
	constructor(id : string){

		super(id, {
			button_name : "hello"	
		}, "btn")


	}


	trigger(){
		this.outputs.forEach(sink => sink.pipe(new Map(), this.id))
	}
}

export class VarBlock extends Block{


	constructor(id : string){
		super(id, {
			
			select_name : [...state.keys()],
			input_value : ""
		}, "var")

		this.pass_function = (input : Map<String, any>) => {	
			console.log(input);

			input.set(this.fields.select_name, this.fields.input_value)

			return input
		}

	}
}

export class GetBlock extends Block{

	constructor(id : string){
		super(id, {
			select_name : [...state.keys()]
		}, "get")

		this.pass_function = (inp : Map<String, any>) => {
					
			inp.set(this.fields.select_name, state.get(this.fields.select_name));

			return inp
		}
	}

}

export class ReceiveBlock extends Block{
	constructor(id : string){
		super(id, {

		}, "receive")
	}	
}

export class SplitBlock extends Block{
	
	constructor(id : string){
		super(id, {
			input_name : "field to split"
		}, "split")
	}	
}

export class SendBlock extends Block{

	constructor(id : string){
		super(id, {

		}, "send")
	}	
}

export const block_types = new Map([
	["receive", ReceiveBlock],
	["send", SendBlock],
	["init", InitBlock],
	["get variable", GetBlock],
	["set variable", VarBlock],
	["split", SplitBlock],
	["through", ThroughBlock],	
	["button", ButtonBlock],

	["log", LogBlock]
])


function create_value_selector(block : Block){

	let value_field = document.createElement("div");
	value_field.id = "value-" + block.id

	let fields = Object.keys(block.fields);

	
	for(let field_name of fields){

		let field = block.fields[field_name]	
		
		if(field_name == "button_name"){
			let button = document.createElement("button");
			button.innerHTML = field;

			button.addEventListener("click", () => {
				let changed_block = blocks.get(block.id);

				changed_block.trigger()
			})

			value_field.appendChild(button);

			continue;
		}
		
		if(field instanceof Array){
			let selector = document.createElement("select");
			
			selector.addEventListener("mousedown", e => {
				selector.innerHTML = [...state.keys()].map(s => `<option value="${s}">${s}</option>`).join("")
			})

			selector.addEventListener("change", (e) => {
				let new_value = e.target.value


				let changed_block = blocks.get(block.id);

				changed_block.change_field([field_name], [new_value])
			})
				

			selector.innerHTML = [...state.keys()].map(s => `<option value="${s}">${s}</option>`).join("")
			

			value_field.appendChild(selector)	
			continue;
		}

			let input = document.createElement("input")

			input.addEventListener("focusout", e => {
				let new_value = e.target.value;

				let changed_block = blocks.get(block.id);

				changed_block.change_field([field_name], [new_value])
			})

			input.addEventListener("focusin", e => {
				
				if(!state.has(e.target.value)) return;
				state.delete(e.target.value)
			})

			value_field.appendChild(input)

	}	

	
	return value_field
}

export function create_drag_card(){

	let id = crypto.randomUUID(); 

	let card = document.createElement("div")

	card.id = "card-" + id;
	card.classList.add("drag-card")


	let type_selector = document.createElement("select");
	type_selector.id = "select-" + id;

	type_selector.value = "receive";

	let block =  new ReceiveBlock(id);

	blocks.set(id, block);

	let type_selection = [...block_types.keys()].map(s => `<option value="${s}">${s}</option>`).join("");

	type_selector.innerHTML = type_selection;

	type_selector.addEventListener("change", (e) => {
		
		let type = e.target.value;

		let block_type = block_types.get(type);
		
		let block = new block_type(id);

		blocks.set(id, block)


		let value_field = document.getElementById("value-" + id);
		
			

		value_field?.replaceWith(create_value_selector(block))

	})

	let value_field = create_value_selector(block)

		
	


	card.appendChild(type_selector);

	card.appendChild(value_field)

	return card;
}
