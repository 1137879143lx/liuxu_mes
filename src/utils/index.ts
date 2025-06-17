// filepath: e:\porject\liuxu_mes\liuxu_mes\src\utils\index.ts

export function formatDate(date: Date, format: string): string {
    const options: Intl.DateTimeFormatOptions = {};
    if (format.includes('YYYY')) options.year = 'numeric';
    if (format.includes('MM')) options.month = '2-digit';
    if (format.includes('DD')) options.day = '2-digit';
    return new Intl.DateTimeFormat('default', options).format(date);
}

export function calculateTotal(items: Array<{ quantity: number; price: number }>): number {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
}

export function debounce(func: Function, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return function (...args: any[]) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}