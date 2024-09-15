export const selection_option = new Map([
	["receive message", {}],
	["split parameter", [
		"sender_id",
		"own"
	]],
	["variable", ["get", "set"]],
	["function", null],
	["action", null],
	["send message", null],
])


function create_selector(parent_id : string){
	

	let selector = document.createElement("select")
	selector.id = "selector" + parent_id;
	selector.innerHTML = [...selection_option.keys()].map(s => `<option value="${s}">${s}</option>`).join("");

	

	selector.addEventListener("change", e => {
		

		let parent_card = document.getElementById("card-" + parent_id);


		parent_card?.setAttribute("mode", e.target.value);


		

	})

	return selector
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
