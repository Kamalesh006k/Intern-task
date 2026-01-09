"""
Database Migration Script
Adds new columns to the users table for profile management features
"""
import pymysql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv('DATABASE_URL', 'mysql+pymysql://root:admin@123@127.0.0.1/primetrade')

print(f"Database URL: {DATABASE_URL}")

# Parse database URL
# Format: mysql+pymysql://user:password@host/database
import re
match = re.match(r'mysql\+pymysql://([^:]+):([^@]+)@([^/]+)/(.+)', DATABASE_URL)
if not match:
    print("Error: Could not parse database URL")
    exit(1)

user, password, host, database = match.groups()
# URL decode password
password = password.replace('%40', '@')

print(f"\nConnecting to MySQL database:")
print(f"  Host: {host}")
print(f"  User: {user}")
print(f"  Database: {database}")

try:
    # Connect to MySQL
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    
    print("\n✓ Connected to database successfully")
    
    with connection.cursor() as cursor:
        # Check if columns already exist
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'users'
        """, (database,))
        
        existing_columns = [row['COLUMN_NAME'] for row in cursor.fetchall()]
        print(f"\n✓ Found existing columns in users table: {', '.join(existing_columns)}")
        
        # Add new columns if they don't exist
        migrations = []
        
        if 'full_name' not in existing_columns:
            migrations.append(("full_name", "ALTER TABLE users ADD COLUMN full_name VARCHAR(100) NULL"))
        
        if 'bio' not in existing_columns:
            migrations.append(("bio", "ALTER TABLE users ADD COLUMN bio TEXT NULL"))
        
        if 'phone' not in existing_columns:
            migrations.append(("phone", "ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL"))
        
        if 'avatar_url' not in existing_columns:
            migrations.append(("avatar_url", "ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL"))
        
        if 'updated_at' not in existing_columns:
            migrations.append(("updated_at", "ALTER TABLE users ADD COLUMN updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
        
        if not migrations:
            print("✓ All user profile columns already exist. No migration needed.")
        else:
            print(f"\n📝 Running {len(migrations)} migrations on users table...")
            for col_name, migration in migrations:
                print(f"   Adding column: {col_name}")
                cursor.execute(migration)
            
            connection.commit()
            print("✓ User table migrations completed successfully!")
        
        # Check if tasks table exists, if not create it
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'tasks'
        """, (database,))
        
        if cursor.fetchone()['count'] == 0:
            print("\n📝 Creating tasks table...")
            cursor.execute("""
                CREATE TABLE tasks (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(100) NOT NULL,
                    description TEXT NOT NULL,
                    status VARCHAR(20) DEFAULT 'pending',
                    priority VARCHAR(20) DEFAULT 'medium',
                    due_date DATETIME NULL,
                    user_id INT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_status (status),
                    INDEX idx_priority (priority)
                )
            """)
            connection.commit()
            print("✓ Tasks table created successfully!")
        else:
            print("\n✓ Tasks table already exists")
        
        # Check if trade_notes table exists and has data
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'trade_notes'
        """, (database,))
        
        if cursor.fetchone()['count'] > 0:
            cursor.execute("SELECT COUNT(*) as count FROM trade_notes")
            note_count = cursor.fetchone()['count']
            
            if note_count > 0:
                print(f"\n⚠️  Warning: Found {note_count} records in old 'trade_notes' table")
                print("   These will NOT be automatically migrated to 'tasks' table")
                print("   You may want to manually migrate this data if needed")
    
    connection.close()
    print("\n" + "="*60)
    print("✅ DATABASE MIGRATION COMPLETED SUCCESSFULLY!")
    print("="*60)
    print("\nYou can now restart your backend server.")
    print("The registration and authentication should work properly now.")
    
except Exception as e:
    print(f"\n❌ Error during migration: {e}")
    import traceback
    traceback.print_exc()
    exit(1)
