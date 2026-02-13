#!/usr/bin/env python3
"""
EMAIL ARCHIVING SYSTEM - CLIENT SETUP SCRIPT
============================================
Скрипт за автоматично клониране на email архивираща система за нов клиент
Версия: 1.0
"""

import os
import sys
import json
import shutil
import subprocess
from pathlib import Path
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

class ClientSetup:
    def __init__(self):
        self.script_dir = Path(__file__).parent
        self.schema_file = self.script_dir / "outlook_emails_schema.sql"
        self.config_template = self.script_dir / "graph_config.json"
        self.python_script = self.script_dir / "graph_email_extractor_v5.py"
        
    def get_client_info(self):
        """Получава информация за новия клиент"""
        print("=" * 60)
        print("EMAIL ARCHIVING SYSTEM - CLIENT SETUP")
        print("=" * 60)
        
        client_info = {}
        
        # Основна информация
        client_info['client_name'] = input("Име на клиента: ").strip()
        client_info['database_name'] = input("Име на базата данни: ").strip()
        
        # Microsoft Graph настройки
        print("\n--- Microsoft Graph настройки ---")
        client_info['client_id'] = input("Client ID: ").strip()
        client_info['client_secret'] = input("Client Secret: ").strip()
        client_info['tenant_id'] = input("Tenant ID: ").strip()
        client_info['user_email'] = input("Email адрес на потребителя: ").strip()
        
        # База данни настройки
        print("\n--- База данни настройки ---")
        client_info['db_host'] = input("DB Host (localhost): ").strip() or "localhost"
        client_info['db_user'] = input("DB User (postgres): ").strip() or "postgres"
        client_info['db_password'] = input("DB Password: ").strip()
        client_info['db_port'] = input("DB Port (5432): ").strip() or "5432"
        
        # Мониторинг настройки
        print("\n--- Мониторинг настройки ---")
        client_info['check_interval'] = input("Интервал на проверка в минути (3): ").strip() or "3"
        client_info['base_path'] = input("Папка за файлове (C:/EmailAttachments): ").strip() or "C:/EmailAttachments"
        
        return client_info
    
    def create_database(self, client_info):
        """Създава нова база данни"""
        try:
            print(f"\nСъздаване на база данни: {client_info['database_name']}")
            
            # Свързване към PostgreSQL като superuser
            conn = psycopg2.connect(
                host=client_info['db_host'],
                user=client_info['db_user'],
                password=client_info['db_password'],
                port=client_info['db_port'],
                database='postgres'  # Свързване към default база
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            
            with conn.cursor() as cursor:
                # Проверка дали базата съществува
                cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (client_info['database_name'],))
                if cursor.fetchone():
                    print(f"Базата {client_info['database_name']} вече съществува!")
                    choice = input("Искаш ли да я изтриеш и създадеш нова? (y/N): ").strip().lower()
                    if choice == 'y':
                        cursor.execute(f"DROP DATABASE {client_info['database_name']}")
                        print("Старата база е изтрита")
                    else:
                        print("Отказване...")
                        return False
                
                # Създаване на нова база
                cursor.execute(f"CREATE DATABASE {client_info['database_name']}")
                print(f"Базата {client_info['database_name']} е създадена успешно!")
            
            conn.close()
            return True
            
        except Exception as e:
            print(f"Грешка при създаване на базата: {e}")
            return False
    
    def import_schema(self, client_info):
        """Импортира схемата в новата база"""
        try:
            print(f"\nИмпортиране на схемата в {client_info['database_name']}")
            
            # Изпълняване на SQL скрипта
            cmd = [
                'psql',
                '-h', client_info['db_host'],
                '-U', client_info['db_user'],
                '-d', client_info['database_name'],
                '-f', str(self.schema_file)
            ]
            
            # Задаване на паролата чрез environment variable
            env = os.environ.copy()
            env['PGPASSWORD'] = client_info['db_password']
            
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("Схемата е импортирана успешно!")
                return True
            else:
                print(f"Грешка при импортиране: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"Грешка при импортиране на схемата: {e}")
            return False
    
    def create_config(self, client_info):
        """Създава конфигурационен файл за новия клиент"""
        try:
            print(f"\nСъздаване на конфигурация за {client_info['client_name']}")
            
            config = {
                "client_id": client_info['client_id'],
                "client_secret": client_info['client_secret'],
                "tenant_id": client_info['tenant_id'],
                "user_email": client_info['user_email'],
                "database": {
                    "host": client_info['db_host'],
                    "database": client_info['database_name'],
                    "user": client_info['db_user'],
                    "password": client_info['db_password'],
                    "port": int(client_info['db_port'])
                },
                "monitoring": {
                    "check_interval_minutes": int(client_info['check_interval']),
                    "bootstrap_email_count": 100
                }
            }
            
            # Създаване на папка за клиента
            client_dir = self.script_dir / f"client_{client_info['client_name'].replace(' ', '_').lower()}"
            client_dir.mkdir(exist_ok=True)
            
            # Записване на конфигурацията
            config_file = client_dir / "graph_config.json"
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            
            # Копиране на Python скрипта
            python_file = client_dir / "graph_email_extractor_v5.py"
            shutil.copy2(self.python_script, python_file)
            
            # Създаване на папка за файлове
            base_path = Path(client_info['base_path'])
            base_path.mkdir(parents=True, exist_ok=True)
            
            print(f"Конфигурацията е създадена в: {client_dir}")
            print(f"Папка за файлове: {base_path}")
            
            return True
            
        except Exception as e:
            print(f"Грешка при създаване на конфигурацията: {e}")
            return False
    
    def create_startup_scripts(self, client_info):
        """Създава скриптове за стартиране"""
        try:
            client_dir = self.script_dir / f"client_{client_info['client_name'].replace(' ', '_').lower()}"
            
            # Windows batch файл
            batch_content = f"""@echo off
echo Starting Email Archiving System for {client_info['client_name']}
cd /d "{client_dir}"
python graph_email_extractor_v5.py
pause
"""
            batch_file = client_dir / "start_email_archiving.bat"
            with open(batch_file, 'w', encoding='utf-8') as f:
                f.write(batch_content)
            
            # Python скрипт за еднократно изпълнение
            once_content = f"""@echo off
echo Running one-time email extraction for {client_info['client_name']}
cd /d "{client_dir}"
python graph_email_extractor_v5.py --once
pause
"""
            once_file = client_dir / "run_once.bat"
            with open(once_file, 'w', encoding='utf-8') as f:
                f.write(once_content)
            
            print(f"Скриптове за стартиране са създадени в: {client_dir}")
            return True
            
        except Exception as e:
            print(f"Грешка при създаване на скриптовете: {e}")
            return False
    
    def run_setup(self):
        """Главна функция за setup"""
        try:
            # Получаване на информация за клиента
            client_info = self.get_client_info()
            
            # Проверка на файлове
            if not self.schema_file.exists():
                print(f"Грешка: Файлът {self.schema_file} не съществува!")
                return False
            
            if not self.python_script.exists():
                print(f"Грешка: Файлът {self.python_script} не съществува!")
                return False
            
            # Създаване на база данни
            if not self.create_database(client_info):
                return False
            
            # Импортиране на схемата
            if not self.import_schema(client_info):
                return False
            
            # Създаване на конфигурация
            if not self.create_config(client_info):
                return False
            
            # Създаване на скриптове за стартиране
            if not self.create_startup_scripts(client_info):
                return False
            
            print("\n" + "=" * 60)
            print("SETUP ЗАВЪРШЕН УСПЕШНО!")
            print("=" * 60)
            print(f"Клиент: {client_info['client_name']}")
            print(f"База данни: {client_info['database_name']}")
            print(f"Папка: client_{client_info['client_name'].replace(' ', '_').lower()}")
            print("\nЗа стартиране:")
            print("1. Еднократно: run_once.bat")
            print("2. Непрекъснато: start_email_archiving.bat")
            
            return True
            
        except KeyboardInterrupt:
            print("\nSetup е прекъснат от потребителя")
            return False
        except Exception as e:
            print(f"Грешка при setup: {e}")
            return False

def main():
    setup = ClientSetup()
    success = setup.run_setup()
    
    if success:
        print("\nСистемата е готова за използване!")
    else:
        print("\nSetup неуспешен!")
        sys.exit(1)

if __name__ == "__main__":
    main()
