// Client-side script to split markdown content into cards based on HR tags
document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.querySelector('.markdown-content');
    if (!contentContainer) return;

    // Create a fragment to build the new structure
    const fragment = document.createDocumentFragment();
    let currentCard = createCard();
    let hasContent = false;

    // Move children to cards
    // note: contentContainer.childNodes is live, but we iterate a static array
    const nodes = Array.from(contentContainer.childNodes);

    nodes.forEach(node => {
        if (node.tagName === 'HR') {
            if (hasContent) {
                fragment.appendChild(currentCard);
                currentCard = createCard();
                hasContent = false;
            }
            // We discard the HR element itself
        } else {
            // Check if node is meaningful content (not just empty text)
            // But we append everything to preserve layout, just checking for "hasContent" to enable the card
            currentCard.appendChild(node);

            // Allow card execution if it has elements or non-empty text
            if (node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim().length > 0)) {
                hasContent = true;
            }
        }
    });

    // Append the final card if it has content
    if (hasContent) {
        fragment.appendChild(currentCard);
    }

    // Replace layout
    if (fragment.children.length > 0) {
        contentContainer.innerHTML = '';
        contentContainer.appendChild(fragment);
    } else {
        // If no content was wrapped (e.g. empty or just one block without HR?),
        // In the logic above, if there are no HRs, everything goes into one card.
        // If nodes exist, hasContent will likely be true, so one card is appended.
        // So we are good.
    }
});

function createCard() {
    const card = document.createElement('div');
    card.className = 'detail-card glass';
    // Preserve any specific styles for inner content if needed
    return card;
}
