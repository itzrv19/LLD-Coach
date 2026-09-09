import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const problems = [
    {
      title: 'Parking Lot',
      shortDescription: 'Design an object-oriented parking lot system.',
      detailedStatement:
        'Design a parking lot system that can accommodate different types of vehicles (cars, motorcycles, trucks). The parking lot has multiple levels, and each level has multiple parking spots of different sizes.',
      functionalReqs:
        '- The parking lot should have multiple levels.\n- It can park different types of vehicles: Motorcycles, Cars, Trucks.\n- Spots are of different sizes: Compact, Regular, Large.\n- A motorcycle can park in any spot.\n- A car can park in a regular or large spot.\n- A truck can only park in a large spot.\n- The system should be able to allocate a spot to a vehicle when it enters.\n- It should free up a spot when the vehicle leaves.\n- It should calculate the parking fee based on the vehicle type and duration.',
      constraints:
        '- Max 10 levels, max 100 spots per level.\n- Payment processing is externalized but the fee calculation is internal.',
      suggestedThinking:
        '- How do you model Vehicle and Spot hierarchies?\n- How does the system find the next available spot?\n- How do you decouple the pricing strategy from the core parking logic?',
      difficulty: 'MEDIUM',
    },
    {
      title: 'Vending Machine',
      shortDescription: 'Design a state-based vending machine.',
      detailedStatement:
        'Design a software for a Vending Machine. The machine supports different states (e.g., waiting for money, dispensing product, refunding) and should handle inventory management.',
      functionalReqs:
        '- Accept coins of 1, 5, 10, 25 cents.\n- Allow user to select products.\n- Dispense product and return change if sufficient funds.\n- Cancel request and return money.\n- Keep track of inventory for products.\n- Keep track of available change (coins).\n- Support state transitions safely.',
      constraints:
        '- Extensibility for new payment methods or product types is a plus.\n- Handle out-of-stock scenarios gracefully.',
      suggestedThinking:
        '- The State Design Pattern is often used here. How would you apply it?\n- How do you ensure transactions are atomic (dispense + change)?',
      difficulty: 'HARD',
    },
    {
      title: 'Elevator System',
      shortDescription: 'Design a multi-elevator control system.',
      detailedStatement:
        'Design an elevator system for a building with multiple floors and multiple elevators. Focus on the scheduling algorithm and state management of individual elevators.',
      functionalReqs:
        '- Users can request an elevator from any floor (up/down).\n- Users can press a floor button inside the elevator.\n- The system must dispatch the most appropriate elevator.\n- Handle edge cases like weight limits, emergency stops.\n- Provide an API for the elevator to report its state (floor, direction, doors open/closed).',
      constraints:
        '- Building has 50 floors and 4 elevators.\n- Optimize for wait time or throughput.',
      suggestedThinking:
        '- What algorithm handles dispatching? (e.g., SCAN algorithm)\n- How do the controllers and elevators communicate?',
      difficulty: 'HARD',
    },
    {
      title: 'Library Management System',
      shortDescription: 'Design a system to manage books, members, and borrowing.',
      detailedStatement:
        'Design a Library Management System that allows members to search for books, borrow them, and return them, while librarians manage the catalog.',
      functionalReqs:
        '- Any library member should be able to search books by their title, author, subject category as well by the publication date.\n- Each book will have a unique identification number and other details including a rack number which will help to physically locate the book.\n- There could be more than one copy of a book, and library members should be able to check-out and reserve any copy.\n- The system should be able to retrieve information like who took a particular book or what are the books checked-out by a specific library member.\n- Maximum of 5 books can be checked out by a member.',
      constraints:
        '- Fines are calculated on late returns (after 14 days).\n- Extensibility for digital books is a plus.',
      suggestedThinking:
        '- Differentiate between a Book (title/author) and a BookItem (specific physical copy).\n- How do you manage the state of a BookItem (Available, Reserved, Loaned, Lost)?',
      difficulty: 'EASY',
    },
  ];

  for (const problem of problems) {
    await prisma.problem.create({
      data: problem,
    });
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
