package com.prephub;

public class App {
    public static void main(String[] args) {
        System.out.println("Hello from the Maven Demo Service!");
        while (true) {
            try {
                Thread.sleep(10000); // keep container alive
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
