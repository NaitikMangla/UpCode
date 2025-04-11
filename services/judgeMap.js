const judgeMap = new Map() // Map sockets to their judge instance

function get(socket){
    return judgeMap.get(socket)
}
function set(socket, judge){
    judgeMap.set(socket, judge)
}
function remove(socket){
    judgeMap.delete(socket)
}
function clear(){
    judgeMap.clear()
}
function size(){
    return judgeMap.size()
}
function has(socket){
    return judgeMap.has(socket)
}

module.exports = {
    get,
    set,
    remove,
    clear,
    size,
    has
}