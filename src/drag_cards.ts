import { blocks, ReceiveBlock, Block, VarBlock, InitBlock, GetBlock, SendBlock, SplitBlock, construct_block } from "./model"


export const selection_option = new Map([
	["receive message", ReceiveBlock],
	["split parameter", SplitBlock],
	["init variable", InitBlock],
	["variable", VarBlock],
	["send message", SendBlock],
	["get variable", GetBlock]
])


function create_selector(parent_id : string){

	let element = document.createElement("div");

	

	let selector = document.createElement("select")
	selector.id = "selector" + parent_id;
	selector.innerHTML = [...selection_option.keys()].map(s => `<option value="${s}">${s}</option>`).join("");

	let block = new ReceiveBlock(parent_id)

	blocks.set(parent_id, block);

	let appendix = construct_block(block);

	

	selector.addEventListener("change", e => {
		

		let parent_card = document.getElementById("card-" + parent_id);

			

		let new_type = selection_option.get(e.target.value);

		let new_block = new new_type(parent_id)


		blocks.set(parent_id, new_block)

		console.log(new_block)

	})

	element.appendChild(selector);
	
	element.appendChild(appendix)

	return element
}


export function create_drag_card(){

	let card = document.createElement("div");

	card.classList.add("drag-card");

	card.setAttribute("mode", "receive message")

	let id = crypto.randomUUID();	

	let selector = create_selector(id);

	card.appendChild(selector)

	card.id = "card-" + id

	
	return card
}
