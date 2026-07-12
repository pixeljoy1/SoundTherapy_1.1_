// Name pools drawn from the Indian diaspora — a rough, respectful mix across
// regions. Not exhaustive; intent is variety and cultural texture, not a census.

import type { Rng, } from './rng'
import { pick } from './rng'
import type { Gender, Tribe } from './types'

const MALE_NAMES: Record<Tribe, string[]> = {
  Punjabi: ['Amrit', 'Harbir', 'Gurdeep', 'Jasbir', 'Manvir', 'Ranjit', 'Simran', 'Tejinder'],
  Gujarati: ['Nikhil', 'Bhavesh', 'Chirag', 'Darshan', 'Hemang', 'Kalpesh', 'Milan', 'Nirav'],
  Tamil: ['Arvind', 'Karthik', 'Muthu', 'Prakash', 'Ravi', 'Senthil', 'Vinod', 'Anbu'],
  Bengali: ['Anirban', 'Bikram', 'Debashish', 'Ishaan', 'Kunal', 'Rajat', 'Sourav', 'Tapan'],
  Marathi: ['Aditya', 'Chetan', 'Devendra', 'Kaustubh', 'Mandar', 'Ninad', 'Prasad', 'Sagar'],
  Malayali: ['Anoop', 'Binu', 'Deepak', 'Jibin', 'Manoj', 'Nithin', 'Rohan', 'Vinu'],
  Kashmiri: ['Aariz', 'Bilal', 'Faisal', 'Imran', 'Junaid', 'Rafiq', 'Shahid', 'Zahid'],
  Sindhi: ['Ashok', 'Bharat', 'Dinesh', 'Hari', 'Jagdish', 'Naresh', 'Prem', 'Suresh'],
}

const FEMALE_NAMES: Record<Tribe, string[]> = {
  Punjabi: ['Amrita', 'Harleen', 'Gurpreet', 'Jaspreet', 'Manveet', 'Rajwant', 'Simranjit', 'Tarnjit'],
  Gujarati: ['Anjali', 'Bhavika', 'Chandni', 'Dipika', 'Hemali', 'Kalpana', 'Mital', 'Nita'],
  Tamil: ['Aishwarya', 'Kavitha', 'Malathi', 'Padma', 'Revathi', 'Selvi', 'Vidya', 'Anjali'],
  Bengali: ['Ananya', 'Bishakha', 'Debjani', 'Ishani', 'Kavya', 'Rupa', 'Sohini', 'Tanaya'],
  Marathi: ['Aarti', 'Chaitali', 'Devika', 'Kirti', 'Manasi', 'Neha', 'Priya', 'Shraddha'],
  Malayali: ['Anitha', 'Beena', 'Deepa', 'Jaya', 'Manju', 'Nisha', 'Reshma', 'Vidya'],
  Kashmiri: ['Aaliya', 'Bushra', 'Fariha', 'Iqra', 'Juveria', 'Rabia', 'Shazia', 'Zoya'],
  Sindhi: ['Asha', 'Bindiya', 'Divya', 'Hema', 'Jyoti', 'Nirmala', 'Preeti', 'Sunita'],
}

const SURNAMES: Record<Tribe, string[]> = {
  Punjabi: ['Singh', 'Kaur', 'Grewal', 'Sandhu', 'Dhillon', 'Bajwa'],
  Gujarati: ['Patel', 'Shah', 'Mehta', 'Desai', 'Trivedi', 'Vyas'],
  Tamil: ['Iyer', 'Iyengar', 'Nair', 'Pillai', 'Chettiar', 'Reddy'],
  Bengali: ['Bose', 'Chatterjee', 'Banerjee', 'Ghosh', 'Sen', 'Mukherjee'],
  Marathi: ['Deshpande', 'Joshi', 'Kulkarni', 'Patil', 'Rane', 'Salunkhe'],
  Malayali: ['Menon', 'Nambiar', 'Kurup', 'Panicker', 'Warrier', 'Thampi'],
  Kashmiri: ['Bhat', 'Dar', 'Wani', 'Lone', 'Malik', 'Shah'],
  Sindhi: ['Advani', 'Chawla', 'Hinduja', 'Lalwani', 'Motwani', 'Punjabi'],
}

export function pickName(rng: Rng, tribe: Tribe, gender: Gender): string {
  const first = pick(rng, gender === 'm' ? MALE_NAMES[tribe] : FEMALE_NAMES[tribe])
  const last = pick(rng, SURNAMES[tribe])
  return `${first} ${last}`
}

export function pickSurname(rng: Rng, tribe: Tribe): string {
  return pick(rng, SURNAMES[tribe])
}

// Building names — evocative, plausible for an Indian-diaspora commune.
export const BUILDING_NAME_POOLS = {
  temple: ['Shri Krishna Mandir', 'Ganesha Devalaya', 'Kali Bari', 'Meenakshi Kovil', 'Sai Baba Mandir'],
  market: ['Gandhi Bazaar', 'Chandni Chowk', 'Meena Bazaar', 'Sardar Market', 'Char Bagh Haat'],
  school: ['Ashok Vidyalaya', 'Saraswati Pathshala', 'Nalanda School', 'Tagore Vidya Kendra'],
  farm: ['Ganesha Farmstead', 'Anand Khet', 'Kisan Vaadi', 'Godhuli Farms'],
  workshop: ['Vishwakarma Karkhana', 'Sona Silai Ghar', 'Kumhar Chakra', 'Loha Bhatti'],
  clinic: ['Ayush Vaidyashala', 'Jeevan Clinic', 'Charaka Aushadhalaya'],
  ashram: ['Sant Kabir Ashram', 'Ramakrishna Kutir', 'Yoga Sadhana Ashram'],
  panchayat: ['Panchayat Bhavan', 'Gram Sabha Hall', 'Adarsh Chaupal'],
  court: ['Adalat Bhavan', 'Nyaya Mandir'],
  jail: ['Central Kaidkhana', 'Bandigrih'],
  gallows: ['Phansi Ghar'],
  well: ['Baoli Kund', 'Pyaao Well', 'Amrit Kund'],
  chai_stall: ['Ramu Chai Tapri', 'Sonu ki Chai', 'Adda Chai Stall'],
  home: [
    'Adarsh Niwas',
    'Shanti Kutir',
    'Ashiana',
    'Vasant Vihar',
    'Godavari House',
    'Aangan',
    'Chandan Nivas',
    'Preet Mahal',
    'Sundar Sadan',
    'Kamla Kunj',
  ],
} as const
