// Some code for hitting the backend...
const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setLabels([]);

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('http://localhost:4000/analyze-image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to analyze image');
        }

        const data = await response.json();
        return data.lables;
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};