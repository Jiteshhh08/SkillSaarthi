import {
  APPWRITE_DATABASE_ID,
  COLLECTIONS,
  ID,
  Permission,
  Query,
  Role,
  databases,
} from './appwrite'

// Mirror of the seeded catalog (scripts/seed-catalog.mjs) so the UI still works
// before `npm run seed:catalog` has been run against the Appwrite project.
export const FALLBACK_INTERESTS = [
  'Web Development',
  'AI/ML',
  'Cybersecurity',
  'Cloud',
  'Data',
  'Design',
  'Finance',
  'Research',
  'Entrepreneurship',
  'Gaming',
  'Education',
  'Healthcare',
]

export async function getInterestCatalog() {
  try {
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.interests,
      [Query.limit(200)],
    )
    if (documents.length > 0) {
      return documents.map((doc) => ({ $id: doc.$id, name: doc.name }))
    }
  } catch {
    // catalog not reachable — fall back below
  }
  return FALLBACK_INTERESTS.map((name) => ({
    $id: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    name,
  }))
}

async function findUserInterest(userId, interestId) {
  try {
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.userInterests,
      [Query.equal('user_id', userId), Query.equal('interest_id', interestId), Query.limit(1)],
    )
    return documents[0]
  } catch {
    return undefined
  }
}

export async function getUserInterests(userId) {
  try {
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.userInterests,
      [Query.equal('user_id', userId), Query.limit(200)],
    )
    if (documents.length === 0) return []

    const catalog = await getInterestCatalog()
    const byId = Object.fromEntries(catalog.map((interest) => [interest.$id, interest]))

    return documents.map((doc) => ({
      $id: doc.$id,
      interest_id: doc.interest_id,
      interest: byId[doc.interest_id] || {
        $id: doc.interest_id,
        name: doc.interest_id,
      },
    }))
  } catch {
    return []
  }
}

export async function addInterest(userId, interestId) {
  const existing = await findUserInterest(userId, interestId)
  if (existing) return existing
  return databases.createDocument(
    APPWRITE_DATABASE_ID,
    COLLECTIONS.userInterests,
    ID.unique(),
    { user_id: userId, interest_id: interestId },
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  )
}

export async function removeInterest(userId, interestId) {
  const existing = await findUserInterest(userId, interestId)
  if (existing) {
    return databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.userInterests, existing.$id)
  }
}
