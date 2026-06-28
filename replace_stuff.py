import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    modified = False

    # 1. Replace alert(...) with toast(...)
    if 'alert(' in content:
        def alert_replacer(match):
            message = match.group(1)
            if 'success' in message.lower():
                return f"toast.success({message})"
            else:
                return f"toast.error({message})"
        
        # Regex to find alert(message) where message can be string literal or variable
        new_content, count = re.subn(r'alert\((.*?)\)', alert_replacer, content, flags=re.DOTALL)
        if count > 0:
            content = new_content
            modified = True

    # 2. Replace loading text with Loader spinner
    loader_texts = {
        '"Saving..."': '(<span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>)',
        "'Adding...'": "(<span className=\"flex items-center gap-2\"><Loader2 className=\"w-4 h-4 animate-spin\" /> Adding...</span>)",
        "'Updating...'": "(<span className=\"flex items-center gap-2\"><Loader2 className=\"w-4 h-4 animate-spin\" /> Updating...</span>)",
        '"Logging in..."': '(<span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</span>)',
        'Submitting...': '<span className="flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span>',
        '"Requesting..."': '(<span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Requesting...</span>)',
        '"Processing..."': '(<span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>)',
        ">Loading...<": '><div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-primary" /><span>Loading...</span></div><'
    }
    
    for text, replacement in loader_texts.items():
        if text in content:
            # specifically for Submitting... in register, it's just text
            if text == 'Submitting...':
                if 'Submitting...' in content and 'Loader2' not in content:
                    content = content.replace(text, replacement)
                    modified = True
            else:
                new_content = content.replace(text, replacement)
                if new_content != content:
                    content = new_content
                    modified = True

    if modified:
        # Add imports if necessary
        if 'toast.' in content and 'react-hot-toast' not in content:
            content = 'import { toast } from "react-hot-toast";\n' + content
        
        if 'Loader2' in content and 'Loader2' not in original_content:
            if 'lucide-react' in content:
                # Add Loader2 to existing lucide-react import
                content = re.sub(r'import\s+{(.*?)}\s+from\s+["\']lucide-react["\'];?', 
                                 lambda m: f'import {{{m.group(1)}, Loader2}} from "lucide-react";' if 'Loader2' not in m.group(1) else m.group(0), 
                                 content)
            else:
                content = 'import { Loader2 } from "lucide-react";\n' + content

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Modified {filepath}")

def main():
    src_dir = os.path.join(os.getcwd(), 'src')
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
