import ServiceForm from "@/components/admin/ServiceForm";

export default function NewServicePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Add New Service</h1>
        <p className="text-gray-400 mt-1">Create a new service offering for your customers</p>
      </div>
      <ServiceForm />
    </div>
  );
}
