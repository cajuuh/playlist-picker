import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data', 'submissions.json');
const MAX_TRACKS_PER_PERSON = 2;

function loadFromDisk() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveToDisk() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
}

// In-memory is the source of truth; disk is a persistence mirror. Every
// mutation here happens synchronously (no `await` in between), so two
// requests for the same phone number can never interleave mid-check.
const records = loadFromDisk();

export function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

export function getRecord(phone) {
  const key = normalizePhone(phone);
  return records[key] || null;
}

export function remainingSlots(phone) {
  const record = getRecord(phone);
  if (!record) return MAX_TRACKS_PER_PERSON;
  return Math.max(0, MAX_TRACKS_PER_PERSON - record.tracks.length - record.reserved);
}

/** Synchronously reserve `count` slots for phone. Returns false if not enough remain. */
export function reserveSlots(phone, name, count) {
  const key = normalizePhone(phone);
  if (!key) throw new Error('Phone number required');
  if (!records[key]) {
    records[key] = { name, tracks: [], reserved: 0 };
  }
  const record = records[key];
  const used = record.tracks.length + record.reserved;
  if (used + count > MAX_TRACKS_PER_PERSON) return false;
  record.reserved += count;
  record.name = name || record.name;
  return true;
}

export function commitTrack(phone, track) {
  const key = normalizePhone(phone);
  const record = records[key];
  record.tracks.push(track);
  record.reserved = Math.max(0, record.reserved - 1);
  saveToDisk();
}

export function releaseReservation(phone, count) {
  const key = normalizePhone(phone);
  const record = records[key];
  if (record) {
    record.reserved = Math.max(0, record.reserved - count);
  }
}
