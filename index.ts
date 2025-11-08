'use strict';

class Vertex {
	data: (number | string)[][];
	N: number;
	V: number;
	moves: number[][];
	constructor(input: (number | string)[][]){
		this.data = input;
		this.N = input.length;
		this.V = input[0]!.length;
		this.moves = [];
	}
}

let visitedVertices = new Set<string>();

function getCanonicalRepresentation(tubes: Vertex): string{
	return tubes.data.map(item => item.join(' ')).join();
}
function getNewVertexByApplyingGivenMoveToGivenVertex(i: number, j: number, vertex: Vertex): Vertex{
	let newVertex = structuredClone(vertex);
	let itemFrom = newVertex.data[i]!;
	let itemTo = newVertex.data[j]!;
	
	//From itemFrom, move all movable subitems to itemTo
	while(itemFrom.length>0&&itemTo.length<newVertex.V&&(itemTo.length===0||itemFrom[itemFrom.length-1]===itemTo[itemTo.length-1])){
		itemTo.push(itemFrom.pop()!);
	}
	return newVertex;
}
function getAdjacentVertices(vertex: Vertex): Set<Vertex>{
	let adjacentVerticesOfCurrentVertex = new Set<Vertex>();
	let vertexRepresentation = getCanonicalRepresentation(vertex);
	for(let i=0;i<vertex.N;i++){
		let itemToMoveFrom = vertex.data[i]!;
		for(let j=0;j<vertex.N;j++){
			if(i===j){
				continue;
			}
			let itemToMoveTo = vertex.data[j]!;
			if(canWeMoveMaxPossibleNonzeroNumberOfDropsOfHighestLiquidFromFirstTubeIntoSecondTube(itemToMoveFrom,itemToMoveTo,vertex.V)){
				let newVertex = getNewVertexByApplyingGivenMoveToGivenVertex(i,j,vertex);
				
				//If newVertex was already visited, then we are in a cycle, so we should break it, treating the current vertex as if newVertex isn't adjacent to it
				let representationOfNewVertex = getCanonicalRepresentation(newVertex);
				if(!visitedVertices.has(representationOfNewVertex)){
					newVertex.moves.push([i,j]);
					adjacentVerticesOfCurrentVertex.add(newVertex);
					visitedVertices.add(representationOfNewVertex);
				}
			}
		}
	}
	if(!adjacentVerticesOfCurrentVertex.size){
		vertex.moves.pop();
	}
	return adjacentVerticesOfCurrentVertex;
}
function findMoves(input: (number | string)[][]): number[][]{
	let tubes = new Vertex(input);
	if(tubes.data.length!==tubes.N){
		throw new Error(`Number of tubes should be ${tubes.N}`);
	}
	for(let tube of tubes.data){
		if(tube.length!==tubes.V&&tube.length!==0){
			throw new Error(`Tube volume should be either ${tubes.V} or 0 (empty)`);
		}
	}
	let stack = Array.from(getAdjacentVertices(tubes));
	while(true){
		let vertex = stack.pop()!;
		if(isVertexWithFinalStateReached(vertex)){
			return vertex.moves;
		}
		for(let adjacentVertex of getAdjacentVertices(vertex)){
			stack.push(adjacentVertex);
		}
	}
}
function isVertexWithFinalStateReached(tubes: Vertex): boolean{
	for(let tube of tubes.data){
		let highestLiquidDrop = tube[0];
		for(let i=1;i<tubes.V;i++){
			if(tube[i]!==highestLiquidDrop){
				return false;
			}
		}
	}
	return true;
}
function canWeMoveMaxPossibleNonzeroNumberOfDropsOfHighestLiquidFromFirstTubeIntoSecondTube(firstTube: (number | string)[], secondTube: (number | string)[], V: number): boolean{
	let firstTubeLen = firstTube.length;
	if(firstTubeLen===0){
		return false;
	}
	let secondTubeLen = secondTube.length;
	if(secondTubeLen===V){
		return false;
	}
	let topLiquidDropFromFirstTube = firstTube[firstTubeLen-1];
	if(secondTubeLen){
		if(secondTube[secondTubeLen-1]!==topLiquidDropFromFirstTube){
			return false;
		}
	}else{
		//Extra rule: there's no need to move anything from a {tube that contains only one color} to an empty tube
		let doAllDropsInFirstTubeHaveSameColor = true;
		let bottomLiquidDropFromFirstTube = firstTube[0];
		for(let i=1;i<firstTubeLen;i++){
			if(firstTube[i]!==bottomLiquidDropFromFirstTube){
				doAllDropsInFirstTubeHaveSameColor = false;
				break;
			}
		}
		if(doAllDropsInFirstTubeHaveSameColor){
			return false;
		}
	}
	return true;
}
/*
function generateTubes(N: number, V: number, M: number): number[][]{ //M is the number of different liquids across all tubes
	if(N<=M){
		throw new Error(`Number of tubes should be greater than number of liquids`);
	}
	let tubes = [];
	
	return tubes;
}
*/

//Equal numbers in input can be safely replaced with equal strings
console.log(findMoves([
  [ 4, 4, 10, 2 ], [ 8, 12, 8, 1 ],
  [ 9, 5, 7, 10 ], [ 5, 2, 3, 5 ],
  [ 7, 8, 11, 6 ], [ 2, 1, 12, 12 ],
  [ 11, 8, 7, 4 ], [ 1, 3, 11, 10 ],
  [ 9, 9, 7, 10 ], [ 11, 6, 2, 6 ],
  [ 3, 9, 6, 4 ],  [ 1, 12, 3, 5 ],
  [], []
]));

module.exports = findMoves;