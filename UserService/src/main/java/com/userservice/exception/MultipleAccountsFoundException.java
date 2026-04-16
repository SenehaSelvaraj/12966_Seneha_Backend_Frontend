package com.userservice.exception;

public class MultipleAccountsFoundException extends RuntimeException {
    public MultipleAccountsFoundException(String message) {
        super(message);
    }
}
