#!/bin/bash

# ==================== SCSS COMPILATION & VALIDATION SCRIPT ====================
# This script compiles SCSS partials to CSS and validates the output

echo "=========================================="
echo "SCSS MODULARIZATION - COMPILATION PHASE"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCSS_DIR="public/scss"
STYLES_DIR="public/styles"
ORIGINAL_CSS="$STYLES_DIR/admin.css"
OUTPUT_CSS="$STYLES_DIR/admin-compiled.css"
OUTPUT_MIN_CSS="$STYLES_DIR/admin-compiled.min.css"

# Step 1: Check if SCSS files exist
echo -e "${BLUE}[1/6] Checking SCSS files...${NC}"
SCSS_FILES=("_variables" "_global" "_utilities" "_layout" "_navbar" "_forms" "_search" "_buttons" "_tables" "_cards" "_estaciones" "_ofertas" "_cierres")
MISSING_FILES=0

for file in "${SCSS_FILES[@]}"; do
    if [ -f "$SCSS_DIR/${file}.scss" ]; then
        echo -e "${GREEN}✓${NC} Found: ${file}.scss"
    else
        echo -e "${RED}✗${NC} Missing: ${file}.scss"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ ! -f "$SCSS_DIR/admin.scss" ]; then
    echo -e "${RED}✗${NC} Missing: admin.scss (master file)"
    MISSING_FILES=$((MISSING_FILES + 1))
else
    echo -e "${GREEN}✓${NC} Found: admin.scss (master file)"
fi

if [ $MISSING_FILES -gt 0 ]; then
    echo -e "${RED}ERROR: $MISSING_FILES SCSS files are missing!${NC}"
    exit 1
fi
echo ""

# Step 2: Count lines in original CSS
echo -e "${BLUE}[2/6] Analyzing original CSS...${NC}"
if [ -f "$ORIGINAL_CSS" ]; then
    ORIGINAL_LINES=$(wc -l < "$ORIGINAL_CSS")
    ORIGINAL_SIZE=$(du -h "$ORIGINAL_CSS" | cut -f1)
    echo -e "${GREEN}✓${NC} Original admin.css: $ORIGINAL_LINES lines, $ORIGINAL_SIZE"
else
    echo -e "${YELLOW}⚠${NC} Original admin.css not found"
fi
echo ""

# Step 3: Try to compile with sass if available
echo -e "${BLUE}[3/6] Checking SCSS compiler...${NC}"
if command -v sass &> /dev/null; then
    echo -e "${GREEN}✓${NC} Found sass compiler"
    echo ""
    
    echo -e "${BLUE}[4/6] Compiling SCSS to CSS...${NC}"
    sass "$SCSS_DIR/admin.scss" "$OUTPUT_CSS" --style=expanded 2>&1
    
    if [ -f "$OUTPUT_CSS" ]; then
        echo -e "${GREEN}✓${NC} Compilation successful"
        COMPILED_LINES=$(wc -l < "$OUTPUT_CSS")
        COMPILED_SIZE=$(du -h "$OUTPUT_CSS" | cut -f1)
        echo "  Output: $COMPILED_LINES lines, $COMPILED_SIZE"
        echo ""
        
        # Step 5: Create minified version
        echo -e "${BLUE}[5/6] Creating minified version...${NC}"
        sass "$SCSS_DIR/admin.scss" "$OUTPUT_MIN_CSS" --style=compressed 2>&1
        
        if [ -f "$OUTPUT_MIN_CSS" ]; then
            echo -e "${GREEN}✓${NC} Minified version created"
            MINIFIED_SIZE=$(du -h "$OUTPUT_MIN_CSS" | cut -f1)
            echo "  Minified: $MINIFIED_SIZE"
        else
            echo -e "${YELLOW}⚠${NC} Failed to create minified version"
        fi
        echo ""
    else
        echo -e "${RED}✗${NC} Compilation failed"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠${NC} sass compiler not found (Node Sass or Dart Sass required)"
    echo "  Install with: npm install -g sass"
    echo "  Or: npm install sass --save-dev"
    echo ""
    echo -e "${BLUE}[4/6] Skipping compilation (manual step required)${NC}"
    echo ""
    
    echo -e "${BLUE}[5/6] Skipping minification (requires sass)${NC}"
    echo ""
fi

# Step 6: Summary
echo -e "${BLUE}[6/6] Validation Summary${NC}"
echo "=========================================="

if [ -f "$ORIGINAL_CSS" ] && [ -f "$OUTPUT_CSS" ]; then
    SIZE_REDUCTION=$((100 - ($(wc -c < "$OUTPUT_CSS") * 100 / $(wc -c < "$ORIGINAL_CSS"))))
    echo -e "${GREEN}✓${NC} SCSS Modularization Complete"
    echo ""
    echo "Original CSS Size: $(du -h "$ORIGINAL_CSS" | cut -f1)"
    echo "Compiled CSS Size: $(du -h "$OUTPUT_CSS" | cut -f1)"
    if [ -f "$OUTPUT_MIN_CSS" ]; then
        echo "Minified CSS Size: $(du -h "$OUTPUT_MIN_CSS" | cut -f1)"
    fi
    echo ""
    echo "Files created:"
    echo "  • $OUTPUT_CSS"
    [ -f "$OUTPUT_MIN_CSS" ] && echo "  • $OUTPUT_MIN_CSS"
    echo ""
    echo "Next Steps:"
    echo "1. Update HTML links to use: <link rel=\"stylesheet\" href=\"/styles/admin-compiled.css\">"
    echo "2. For production, use: <link rel=\"stylesheet\" href=\"/styles/admin-compiled.min.css\">"
    echo "3. Test all components in browser"
    echo "4. Run responsive design tests (320px, 480px, 768px, 1024px, 1920px)"
    echo ""
    echo -e "${GREEN}CSS Modularization Validation PASSED ✓${NC}"
    echo "=========================================="
elif [ -f "$OUTPUT_CSS" ]; then
    echo -e "${GREEN}✓${NC} Compilation successful"
    echo "  Output: $OUTPUT_CSS"
    echo "  Size: $(du -h "$OUTPUT_CSS" | cut -f1)"
    echo ""
    echo -e "${YELLOW}NOTE:${NC} Original CSS not found for comparison"
    echo ""
    echo -e "${GREEN}CSS Modularization Validation PASSED ✓${NC}"
    echo "=========================================="
else
    echo -e "${YELLOW}⚠${NC} Manual compilation required"
    echo ""
    echo "Steps to complete:"
    echo "1. Install sass: npm install -g sass (or yarn/pnpm)"
    echo "2. Compile: sass $SCSS_DIR/admin.scss $OUTPUT_CSS"
    echo "3. Run this script again to validate"
    echo ""
    echo "Or in watch mode:"
    echo "sass --watch $SCSS_DIR:$STYLES_DIR"
    echo ""
    echo "=========================================="
fi
