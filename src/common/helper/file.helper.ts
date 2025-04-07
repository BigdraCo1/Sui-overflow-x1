import { writeFile, readFile } from "fs/promises";
import * as fs from "fs";

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Asynchronous example
export async function writeToFile(filename: string, content: string) {
  try {
    await writeFile(filename, content);
  } catch (error) {
    console.error('Error writing file:', error);
  }
}

// Read file asynchronously
export async function readFromFile(filename: string): Promise<string> {
  try {
    return await readFile(filename, 'utf8');
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
}

// Check if file exists synchronously
export function fileExists(filename: string): boolean {
  try {
    return fs.existsSync(filename);
  } catch (error) {
    console.error('Error checking if file exists:', error);
    return false;
  }
}