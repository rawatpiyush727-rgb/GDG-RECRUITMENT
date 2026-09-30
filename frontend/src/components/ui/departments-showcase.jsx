import { BooksShowcase } from "@/components/ui/books-showcase";
import { DEPARTMENTS } from "@/data/departments";

export function DepartmentsShowcase() {
  return (
    <div className="relative h-full min-h-0 w-full">
      <BooksShowcase
        books={DEPARTMENTS}
        heroTitle="DEPARTMENTS"
        navTitle=""
        showNav={false}
        showDetailPanel={true}
        showCarousel={true}
        showLeaves={false}
        className="h-full min-h-0"
        themeColors={{
          bg: '#080808',
          bgLight: '#080808',
          bgDark: '#080808',
          foregroundLight: '#ffffff',
          foregroundDark: '#ffffff',
          navy: '#080808',
          cream: '#f5f5f5',
          lav: '#a0b0d8',
          peri: '#6b7dc4',
          pink: '#4285F4',
        }}
      />
    </div>
  );
}

export default DepartmentsShowcase;
