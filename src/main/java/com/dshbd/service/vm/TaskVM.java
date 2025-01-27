package com.dshbd.service.vm;

import com.dshbd.domain.Board;
import com.dshbd.domain.Task;

public class TaskVM {

    private Task task;
    private Board board;

    public TaskVM(Task task, Board board) {
        this.task = task;
        this.board = board;
    }

    public Task getTask() {
        return task;
    }

    public Board getBoard() {
        return board;
    }
}
