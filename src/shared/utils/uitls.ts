export const removePunctuation = (code: string): string => {
  if (!code) return '';

  return code.replace(/\D/g, '');
};

/**
 * Returns the IDs of rows in `table` whose `name` column matches
 * the given search term using accent- and case-insensitive comparison
 * (powered by the PostgreSQL `unaccent` extension).
 *
 * The table name comes from internal code (never from user input), so
 * using $queryRawUnsafe here is safe. The search value is still passed
 * as a parameterised argument to prevent SQL injection.
 *
 * Usage:
 *   const ids = await findIdsByUnaccentName(prisma, 'User', 'natalia');
 *   where.id = { in: ids };
 */
export async function findIdsByUnaccentName(
  prisma: { $queryRawUnsafe: <T>(query: string, ...values: any[]) => Promise<T> },
  table: string,
  name: string,
): Promise<string[]> {
  const pattern = `%${name}%`;
  const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `SELECT id FROM "${table}" WHERE unaccent(name) ILIKE unaccent($1)`,
    pattern,
  );
  return rows.map((r) => r.id);
}
