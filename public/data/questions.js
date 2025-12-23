const questions = [
    {
        id: 1,
        title: "Reverse a String",
        difficulty: "Easy",
        description: "Write a function that takes a string as input and returns the string reversed. Do not use built-in reverse functions.",
        examples: [
            { input: '"hello"', output: '"olleh"' },
            { input: '"OpenAI"', output: '"IAnepO"' }
        ],
        testCases: [
            { input: '"hello"', expected: '"olleh"' },
            { input: '"world"', expected: '"dlrow"' },
            { input: '"12345"', expected: '"54321"' },
            { input: '"racecar"', expected: '"racecar"' }
        ]
    },
    {
        id: 2,
        title: "Palindrome Check",
        difficulty: "Easy",
        description: "Write a function to determine if a given string is a palindrome. A palindrome reads the same backwards as forwards.",
        examples: [
            { input: '"madam"', output: 'true' },
            { input: '"hello"', output: 'false' }
        ],
        testCases: [
            { input: '"madam"', expected: 'true' },
            { input: '"racecar"', expected: 'true' },
            { input: '"hello"', expected: 'false' },
            { input: '"123"', expected: 'false' }
        ]
    },
    {
        id: 3,
        title: "Factorial",
        difficulty: "Easy",
        description: "Write a function to calculate the factorial of a non-negative integer n. The factorial of 0 is 1.",
        examples: [
            { input: '5', output: '120' },
            { input: '0', output: '1' }
        ],
        testCases: [
            { input: '5', expected: '120' },
            { input: '3', expected: '6' },
            { input: '0', expected: '1' },
            { input: '1', expected: '1' }
        ]
    },
    {
        id: 4,
        title: "Sort an Array",
        difficulty: "Easy",
        description: "Write a function to sort an array of integers in ascending order without using built-in sort functions.",
        examples: [
            { input: '[3, 1, 2]', output: '[1, 2, 3]' },
            { input: '[5, 0, -1]', output: '[-1, 0, 5]' }
        ],
        testCases: [
            { input: '[3, 1, 2]', expected: '[1, 2, 3]' },
            { input: '[10, 5, 8]', expected: '[5, 8, 10]' }
        ]
    },
    {
        id: 5,
        title: "Reverse a Number",
        difficulty: "Easy",
        description: "Write a function that reverses the digits of an integer. Handle negative numbers correctly.",
        examples: [
            { input: '123', output: '321' },
            { input: '-123', output: '-321' }
        ],
        testCases: [
            { input: '100', output: '1' },
             {input: '-56', output: '-65'}
        ]
    },
    {
        id: 6,
        title: "Find Maximum Element",
        difficulty: "Easy",
        description: "Write a function to find the maximum element in an array of numbers.",
        examples: [
            { input: '[1, 3, 2]', output: '3' },
            { input: '[-1, -5, 0]', output: '0' }
        ],
         testCases: [
            { input: '[10, 20, 5]', expected: '20' }
        ]
    },
    {
        id: 7,
        title: "Check Prime Number",
        difficulty: "Easy",
        description: "Write a function that checks if a given number n is a prime number.",
        examples: [
            { input: '7', output: 'true' },
            { input: '4', output: 'false' }
        ],
        testCases: [
             { input: '13', expected: 'true' },
             { input: '1', expected: 'false' }
        ]
    },
    {
        id: 8,
        title: "Fibonacci Sequence",
        difficulty: "Easy",
        description: "Write a function that returns the nth number in the Fibonacci sequence (0, 1, 1, 2, 3, 5...).",
        examples: [
            { input: '5', output: '5' },
            { input: '0', output: '0' }
        ],
        testCases: []
    },
    {
        id: 9,
        title: "Count Vowels",
        difficulty: "Easy",
        description: "Write a function that counts the number of vowels (a, e, i, o, u) in a string.",
        examples: [
            { input: '"hello"', output: '2' },
            { input: '"sky"', output: '0' }
        ],
        testCases: []
    },
    {
        id: 10,
        title: "Remove Duplicates",
        difficulty: "Medium",
        description: "Write a function to remove duplicate elements from an array.",
        examples: [
            { input: '[1, 2, 2, 3]', output: '[1, 2, 3]' },
            { input: '[5, 5, 5]', output: '[5]' }
        ],
        testCases: []
    },
    {
        id: 11,
        title: "Merge Two Sorted Arrays",
        difficulty: "Medium",
        description: "Write a function to merge two sorted arrays into a single sorted array.",
        examples: [
            { input: '[1, 3], [2, 4]', output: '[1, 2, 3, 4]' }
        ],
        testCases: []
    },
    {
        id: 12,
        title: "Find Missing Number",
        difficulty: "Medium",
        description: "Given an array containing n distinct numbers taken from 0, 1, 2, ..., n, find the one that is missing.",
        examples: [
            { input: '[3, 0, 1]', output: '2' },
            { input: '[0, 1]', output: '2' }
        ],
        testCases: []
    },
    {
        id: 13,
        title: "Two Sum",
        difficulty: "Medium",
        description: "Given an array of integers and a target sum, find the indices of the two numbers such that they add up to the target.",
        examples: [
            { input: '[2, 7, 11, 15], 9', output: '[0, 1]' }
        ],
        testCases: []
    },
    {
        id: 14,
        title: "Anagram Check",
        difficulty: "Medium",
        description: "Write a function to check if two strings are anagrams of each other.",
        examples: [
            { input: '"listen", "silent"', output: 'true' },
            { input: '"hello", "world"', output: 'false' }
        ],
        testCases: []
    },
    {
        id: 15,
        title: "Valid Parentheses",
        difficulty: "Medium",
        description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        examples: [
            { input: '"()"', output: 'true' },
            { input: '"([)]"', output: 'false' }
        ],
        testCases: []
    },
    {
        id: 16,
        title: "Find Second Largest",
        difficulty: "Medium",
        description: "Write a function to find the second largest element in an array.",
        examples: [
            { input: '[10, 5, 20, 8]', output: '10' }
        ],
        testCases: []
    },
    {
        id: 17,
        title: "Longest Word",
        difficulty: "Medium",
        description: "Write a function to find the longest word in a given sentence.",
        examples: [
            { input: '"The quick brown fox"', output: '"quick"' }
        ],
        testCases: []
    },
    {
        id: 18,
        title: "Capitalize First Letter",
        difficulty: "Easy",
        description: "Write a function that capitalizes the first letter of every word in a sentence.",
        examples: [
            { input: '"hello world"', output: '"Hello World"' }
        ],
        testCases: []
    },
    {
        id: 19,
        title: "FizzBuzz",
        difficulty: "Easy",
        description: "Write a function that returns 'Fizz' for multiples of 3, 'Buzz' for multiples of 5, and 'FizzBuzz' for multiples of both.",
        examples: [
            { input: '3', output: '"Fizz"' },
            { input: '5', output: '"Buzz"' },
            { input: '15', output: '"FizzBuzz"' }
        ],
        testCases: []
    },
    {
        id: 20,
        title: "Sum of Digits",
        difficulty: "Easy",
        description: "Write a function that calculates the sum of all digits of a number.",
        examples: [
            { input: '123', output: '6' },
            { input: '405', output: '9' }
        ],
        testCases: []
    }
];
