export class Block{
	type : string;

	output_blocks : Block[];
	input_blocks : Block[]

	constructor(type : string){	
		this.type = type
		this.input_blocks = []
		this.output_blocks= []
	}

	add_output(output_block : Block){
		this.output_blocks.push(output_block);

		output_block.add_input(this);
	}

	add_input(input_block : Block){
		this.input_blocks.push(input_block);
	}
	

	change_type(type : string){
		this.type = type;

		if(this.type == "receive"){

		}
		if(this.type == "send"){
			
		}

	}	
}

export function create_block(type : string){
	return new Block(type)
}
