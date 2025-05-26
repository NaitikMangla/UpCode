const {get, set, remove} = require('./judgeMap')
const {handleSubmit} = require('../controller/problem')


class Judge{
    #socket
    #hiddenTestCases
    #timeLimit
    #memoryLimit
    #solutions
    #counter
    constructor(socket, problemData, lang, srccode){
        console.log(problemData.hiddenTestCases)
        this.#timeLimit = problemData.timeLimit
        this.#memoryLimit = problemData.memoryLimit
        this.#socket = socket
        this.#hiddenTestCases = problemData.hiddenTestCases
        this.#solutions = problemData.solutions
        this.lang = lang
        this.srccode = srccode
        this.#counter = -1
        set(this.#socket.id, this)
        console.log(this.#hiddenTestCases)
    }

    getExpectedOutput() {
        return this.#solutions[this.#counter]
    }

    getTestNumber(){
        return this.#counter
    }

    resume(){
        this.#counter++
        if(this.#counter >= this.#hiddenTestCases.length)
        {
            
            this.end("accepted")
            return;
        }
        
        const data = {
            lang : this.lang,
            srccode : this.srccode,
            stdin : this.#hiddenTestCases[this.#counter],
            timeLimit : this.#timeLimit,
            memoryLimit : this.#memoryLimit,
        }

        handleSubmit(data ,this.#socket, this.#counter)


    }

    end(verdict){
        remove(this.#socket)
        this.#socket.emit(verdict)
    }
}

module.exports = Judge