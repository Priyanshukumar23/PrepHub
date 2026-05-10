export const questions = [
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
    },
    { id: 21, title: "Reverse Linked List II", difficulty: "Medium", description: "Given the head of a singly linked list and two integers left and right where left <= right, reverse the nodes of the list from position left to position right.", examples: [{ input: "head = [1,2,3,4,5], left = 2, right = 4", output: "[1,4,3,2,5]" }], testCases: [] },
    { id: 22, title: "Merge k Sorted Lists", difficulty: "Hard", description: "Merge k sorted linked lists and return it as one sorted list.", examples: [{ input: "[[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" }], testCases: [] },
    { id: 23, title: "Reverse Nodes in k-Group", difficulty: "Hard", description: "Reverse the nodes of a linked list k at a time and return its modified list.", examples: [{ input: "head = [1,2,3,4,5], k = 2", output: "[2,1,4,3,5]" }], testCases: [] },
    { id: 24, title: "Binary Tree Maximum Path Sum", difficulty: "Hard", description: "Find the maximum path sum in a binary tree.", examples: [{ input: "root = [1,2,3]", output: "6" }], testCases: [] },
    { id: 25, title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", description: "Design an algorithm to serialize and deserialize a binary tree.", examples: [{ input: "root = [1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]" }], testCases: [] },
    { id: 26, title: "Word Ladder", difficulty: "Hard", description: "Find the length of the shortest transformation sequence from beginWord to endWord.", examples: [{ input: "hit, cog, [hot,dot,dog,lot,log,cog]", output: "5" }], testCases: [] },
    { id: 27, title: "Alien Dictionary", difficulty: "Hard", description: "Return a string of the unique letters in the new alien language sorted in lexicographically increasing order.", examples: [{ input: "[wrt,wrf,er,ett,rftt]", output: "wertf" }], testCases: [] },
    { id: 28, title: "Regular Expression Matching", difficulty: "Hard", description: "Implement regular expression matching with support for '.' and '*'.", examples: [{ input: "s = 'aa', p = 'a*'", output: "true" }], testCases: [] },
    { id: 29, title: "Edit Distance", difficulty: "Hard", description: "Find the minimum number of operations required to convert word1 to word2.", examples: [{ input: "horse, ros", output: "3" }], testCases: [] },
    { id: 30, title: "Longest Valid Parentheses", difficulty: "Hard", description: "Find the length of the longest valid (well-formed) parentheses substring.", examples: [{ input: "')()())'", output: "4" }], testCases: [] },
    { id: 31, title: "Largest Rectangle in Histogram", difficulty: "Hard", description: "Find the area of largest rectangle in the histogram.", examples: [{ input: "[2,1,5,6,2,3]", output: "10" }], testCases: [] },
    { id: 32, title: "Sliding Window Maximum", difficulty: "Hard", description: "Return the max sliding window.", examples: [{ input: "nums = [1,3,-1,-3,5,3,6,7], k = 3", output: "[3,3,5,5,6,7]" }], testCases: [] },
    { id: 33, title: "Trapping Rain Water", difficulty: "Hard", description: "Compute how much water it can trap after raining.", examples: [{ input: "[0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" }], testCases: [] },
    { id: 34, title: "Linked List Cycle", difficulty: "Easy", description: "Determine if a linked list has a cycle in it.", examples: [{ input: "head = [3,2,0,-4], pos = 1", output: "true" }], testCases: [] },
    { id: 35, title: "Invert Binary Tree", difficulty: "Easy", description: "Invert a binary tree.", examples: [{ input: "[4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" }], testCases: [] },
    { id: 36, title: "Binary Tree Level Order Traversal", difficulty: "Medium", description: "Return the level order traversal of its nodes' values.", examples: [{ input: "[3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" }], testCases: [] },
    { id: 37, title: "Clone Graph", difficulty: "Medium", description: "Return a deep copy (clone) of the graph.", examples: [{ input: "adjList = [[2,4],[1,3],[2,4],[1,3]]", output: "[[2,4],[1,3],[2,4],[1,3]]" }], testCases: [] },
    { id: 38, title: "Course Schedule", difficulty: "Medium", description: "Return true if you can finish all courses. Otherwise, return false.", examples: [{ input: "numCourses = 2, prerequisites = [[1,0]]", output: "true" }], testCases: [] },
    { id: 39, title: "Climbing Stairs", difficulty: "Easy", description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps.", examples: [{ input: "3", output: "3" }], testCases: [] },
    { id: 40, title: "Coin Change", difficulty: "Medium", description: "Return the fewest number of coins that you need to make up that amount.", examples: [{ input: "coins = [1,2,5], amount = 11", output: "3" }], testCases: [] },
    { id: 41, title: "Min Stack", difficulty: "Medium", description: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.", examples: [{ input: "[\"MinStack\",\"push\",\"push\",\"getMin\"]", output: "[null,null,null,-3]" }], testCases: [] },
    { id: 42, title: "Evaluate Reverse Polish Notation", difficulty: "Medium", description: "Evaluate the value of an arithmetic expression in Reverse Polish Notation.", examples: [{ input: "[\"2\",\"1\",\"+\",\"3\",\"*\"]", output: "9" }], testCases: [] },
    { id: 43, title: "Implement Queue using Stacks", difficulty: "Easy", description: "Implement a first in first out (FIFO) queue using only two stacks.", examples: [{ input: "[\"MyQueue\",\"push\",\"push\",\"peek\",\"pop\",\"empty\"]", output: "[null,null,null,1,1,false]" }], testCases: [] },
    { id: 44, title: "Design Circular Queue", difficulty: "Medium", description: "Design your implementation of the circular queue.", examples: [{ input: "[\"MyCircularQueue\",\"enQueue\",\"Rear\"]", output: "[null,true,3]" }], testCases: [] },
    { id: 45, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", description: "Find the length of the longest substring without repeating characters.", examples: [{ input: "\"abcabcbb\"", output: "3" }], testCases: [] },
    { id: 46, title: "Word Break", difficulty: "Medium", description: "Determine if s can be segmented into a space-separated sequence of one or more dictionary words.", examples: [{ input: "s = \"leetcode\", wordDict = [\"leet\",\"code\"]", output: "true" }], testCases: [] },
    { id: 47, title: "Number of Islands", difficulty: "Medium", description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.", examples: [{ input: "grid = [[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]", output: "3" }], testCases: [] },
    { id: 48, title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", description: "Find the lowest common ancestor (LCA) of two given nodes in the tree.", examples: [{ input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1", output: "3" }], testCases: [] },
    { id: 49, title: "Valid Anagram", difficulty: "Easy", description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.", examples: [{ input: "s = \"anagram\", t = \"nagaram\"", output: "true" }], testCases: [] },
    { id: 50, title: "Maximum Subarray", difficulty: "Medium", description: "Find the contiguous subarray which has the largest sum and return its sum.", examples: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" }], testCases: [] }
];
