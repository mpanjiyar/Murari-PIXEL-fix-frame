with open('src/components/AdminPurchaseManager.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "{/* Section Title */}"
end_marker = "{/* ORDER REVIEW & DECISION MODAL */}"

s_pos = content.find(start_marker)
e_pos = content.find(end_marker)

print(f"Start pos: {s_pos}, End pos: {e_pos}")
assert s_pos != -1 and e_pos != -1
print("Section found successfully!")
