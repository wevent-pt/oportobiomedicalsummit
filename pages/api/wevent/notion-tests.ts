import { NextApiRequest, NextApiResponse } from 'next'

class TaskHandler {
    tasks: Array<string>

    constructor() {
        this.tasks = []
    }

    addTask(task: string) {
        this.tasks.push(task)
    }

    deleteTask(task: string) {
        this.tasks = this.tasks.filter(t => t !== task)
    }

    getTasks() {
        return this.tasks
    }
}

const taskHandler = new TaskHandler()

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        res.status(200).json(taskHandler.getTasks())
    } else if (req.method === 'POST') {
        const { task } = req.body
        taskHandler.addTask(task)
        res.status(200).json({ message: 'Task added' })
    } else if (req.method === 'DELETE') {
        const { task } = req.body
        taskHandler.deleteTask(task)
        res.status(200).json({ message: 'Task deleted' })
    } else {
        res.status(405).json({ message: 'Method not allowed' })
    }
}
