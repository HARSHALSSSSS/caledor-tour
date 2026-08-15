/** Convert SQLite SQL used in this app into MySQL / MariaDB SQL. */
export function toMysqlSql(sql = "") {
  let s = String(sql);

  s = s.replace(/datetime\('now'\)/gi, "NOW()");
  s = s.replace(/INSERT OR IGNORE/gi, "INSERT IGNORE");
  s = s.replace(
    /strftime\('%Y-%m',\s*created_at\)\s*=\s*strftime\('%Y-%m',\s*'now'\)/gi,
    "DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')"
  );

  s = s.replace(/ON CONFLICT\([^)]+\)\s*DO NOTHING/gi, "ON DUPLICATE KEY UPDATE id = id");

  s = s.replace(/ON CONFLICT\([^)]+\)\s*DO UPDATE SET\s+([\s\S]+)$/i, (_m, sets) => {
    const converted = String(sets).replace(/excluded\.(\w+)/gi, "VALUES($1)");
    return `ON DUPLICATE KEY UPDATE ${converted}`;
  });

  s = s.replace(/ON DUPLICATE KEY/gi, "ON DUPLICATE __MYSQL_DUP_KEY__");
  s = s.replace(/PRIMARY KEY/gi, "__MYSQL_PRIMARY_KEY__");
  s = s.replace(/FOREIGN KEY/gi, "__MYSQL_FOREIGN_KEY__");
  s = s.replace(/(?<![`\w])key(?![`\w])/gi, "`key`");
  s = s.replace(/ON DUPLICATE __MYSQL_DUP_KEY__/gi, "ON DUPLICATE KEY");
  s = s.replace(/__MYSQL_PRIMARY_KEY__/gi, "PRIMARY KEY");
  s = s.replace(/__MYSQL_FOREIGN_KEY__/gi, "FOREIGN KEY");
  s = s.replace(/(?<![`\w])read(?![`\w])/gi, "`read`");

  return s;
}

export function mysqlTableInfoSql(table) {
  return `SELECT COLUMN_NAME AS name
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`;
}

export function parsePragmaTable(sql = "") {
  const match = String(sql).match(/PRAGMA\s+table_info\((\w+)\)/i);
  return match ? match[1] : null;
}
