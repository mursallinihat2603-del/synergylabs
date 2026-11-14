declare module 'javascript-astar' {
 export interface GridNode {x:number;y:number;weight:number}
 export class Graph {constructor(grid:number[][],options?:{diagonal:boolean});grid:GridNode[][]}
 export const astar:{search(graph:Graph,start:GridNode,end:GridNode):GridNode[]};
 const pathfinding: {Graph:typeof Graph;astar:typeof astar};
 export default pathfinding;
}
