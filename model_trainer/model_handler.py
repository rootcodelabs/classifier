import time
import random
import string
from datetime import datetime

class EnvironmentPrinter:
    def __init__(self):
        self.generated_id = self.generate_random_id()

    def generate_random_id(self):
        return ''.join(random.choices(string.ascii_letters + string.digits, k=8))

    def print_id_with_timestamp(self):
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f'Generated ID: {self.generated_id}, Timestamp: {current_time}')

    def execute(self):
        self.print_id_with_timestamp()
        
        for _ in range(2):
            time.sleep(15)
            self.print_id_with_timestamp()
        
        return True

if __name__ == "__main__":
    env_printer = EnvironmentPrinter()
    env_printer.execute()
