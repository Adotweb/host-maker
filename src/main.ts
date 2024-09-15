import { invoke } from "@tauri-apps/api/tauri";
import { create_drag_card } from "./drag_cards"
import { create_block, Block } from "./block"


let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;


async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}


let click_position = {
	x : 0,
	y : 0
}

let card_held : HTMLElement | boolean = false;

let current_connection : string[] = []; 

let adjacency_matrix : string[][] = [];
let lines : any = [];

document.addEventListener("mousemove", (e) => {

	if(card_held instanceof HTMLElement){
		
		card_held.style.transform = `translate(${e.pageX - click_position.x}px, ${e.pageY - click_position.y}px)`


		lines.forEach((line : any) => line.position())
	}

})




document.addEventListener("mouseup", (_e) => {
	card_held = false;
})

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });


  	let board = document.getElementById("board");

	let add_button = document.getElementById("add_button");


	add_button?.addEventListener("click", () => {
		let card = create_drag_card();
		
		card.addEventListener("mousedown", (e) => {

			let rect = card.getBoundingClientRect();

			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			click_position = {x , y};

			card_held = document.getElementById(card.id) || false
		})	

		card.addEventListener("dblclick", _e => {

				

				if(current_connection.length == 1 &&
					!(adjacency_matrix.includes(current_connection) ||
					 adjacency_matrix.includes(current_connection.reverse())) &&
					current_connection[0] != card.id	
				  ){
					
					current_connection.push(card.id)

			

					let line = new LeaderLine(
						document.getElementById(current_connection[0]),
						document.getElementById(current_connection[1]),
					)
					
					lines.push(line)

					adjacency_matrix.push(current_connection)
					current_connection = [];



					return
				}	

				if(current_connection[0] != card.id){

					current_connection.push(card.id)
				}
		})

		board?.appendChild(card);
	})

});
