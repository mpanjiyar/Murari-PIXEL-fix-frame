with open('src/components/ReelsPackModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

t3_start = content.find('{/* TAB 3: EXPLORE CATEGORIES */}')
t4_start = content.find('{/* TAB 4: WHAT\'S INCLUDED */}')
t5_start = content.find('{/* TAB 5: FAQ & SUPPORT */}')
modal_end = content.find('</div>\n      </motion.div>\n    </div>\n  );\n};', t5_start)
if modal_end == -1:
    modal_end = content.rfind('</motion.div>')

print("Tab 3 length:", t4_start - t3_start)
print("Tab 4 length:", t5_start - t4_start)
print("Tab 5 length:", modal_end - t5_start)
