import os

def fix_use_client():
    src_dir = os.path.join(os.getcwd(), 'src')
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                if '"use client";' in content:
                    # check if "use client"; is at the very start (ignoring whitespace)
                    lines = content.split('\n')
                    use_client_idx = -1
                    for i, line in enumerate(lines):
                        if '"use client";' in line:
                            use_client_idx = i
                            break
                    
                    if use_client_idx > 0: # It's not the first line
                        # Remove all occurrences of "use client";
                        content = content.replace('"use client";\n', '')
                        content = content.replace('"use client";', '')
                        # Add it to the top
                        content = '"use client";\n' + content.lstrip()
                        
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Fixed {filepath}")

if __name__ == "__main__":
    fix_use_client()
