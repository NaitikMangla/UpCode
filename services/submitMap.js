const submitMap = new Map();

function get(token){
    return submitMap.get(token)
}

function set(token, socket){
    submitMap.set(token, socket)
}

function remove(token){
    submitMap.delete(token)
}

function clear(){
    submitMap.clear()
}

function size(){
    return submitMap.size()
}

module.exports = {
    get,
    set,
    remove,
    clear,
    size
}